#!/usr/bin/env python3
"""Extract the documented omm CLI surface from source without importing omm.

This intentionally uses only Python's standard-library AST.  Importing the
product package would make the documentation check depend on optional runtime
packages, machine state, and import-time behavior.  Given one omm checkout,
this script always emits the same JSON contract.
"""

from __future__ import annotations

import argparse
import ast
import json
import sys
from pathlib import Path
from typing import Any


COMMAND_FUNCTIONS = {
    "search": "search",
    "install": "install",
    "run": "run",
    "recommend": "recommend",
    "contribute": "contribute",
    "setup": "setup_cmd",
}


class ContractError(RuntimeError):
    pass


def dotted_name(node: ast.AST) -> str | None:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        owner = dotted_name(node.value)
        return f"{owner}.{node.attr}" if owner else node.attr
    return None


def constant_value(node: ast.AST) -> Any:
    if isinstance(node, ast.Constant):
        if node.value is Ellipsis:
            return "required"
        return node.value
    if isinstance(node, ast.Name) and node.id == "Ellipsis":
        return "required"
    raise ContractError(f"unsupported default expression: {ast.unparse(node)}")


def default_contract(node: ast.AST | None) -> dict[str, Any]:
    if node is None:
        return {"kind": "required"}
    value = constant_value(node)
    if value == "required":
        return {"kind": "required"}
    return {"kind": "constant", "value": value}


def call_kind(node: ast.AST) -> str | None:
    if not isinstance(node, ast.Call):
        return None
    name = dotted_name(node.func)
    if name == "typer.Argument":
        return "argument"
    if name == "typer.Option":
        return "option"
    return None


def call_flags(node: ast.Call) -> list[str]:
    # The first positional argument is the default. Remaining string
    # arguments are Click/Typer declarations such as --engine and -e.
    return [
        value
        for arg in node.args[1:]
        if isinstance((value := constant_value(arg)), str) and value.startswith("-")
    ]


def function_parameters(function: ast.FunctionDef) -> list[dict[str, Any]]:
    positional = [*function.args.posonlyargs, *function.args.args]
    first_default = len(positional) - len(function.args.defaults)
    parameters: list[dict[str, Any]] = []

    for index, parameter in enumerate(positional):
        default = function.args.defaults[index - first_default] if index >= first_default else None
        kind = call_kind(default) if default is not None else None
        if kind == "option":
            assert isinstance(default, ast.Call)
            parameters.append(
                {
                    "parameter": parameter.arg,
                    "kind": "option",
                    "flags": call_flags(default),
                    "default": default_contract(default.args[0] if default.args else None),
                }
            )
        elif kind == "argument":
            assert isinstance(default, ast.Call)
            parameters.append(
                {
                    "parameter": parameter.arg,
                    "kind": "argument",
                    "flags": [],
                    "default": default_contract(default.args[0] if default.args else None),
                }
            )
        else:
            parameters.append(
                {
                    "parameter": parameter.arg,
                    "kind": "argument",
                    "flags": [],
                    "default": default_contract(default),
                }
            )

    return parameters


def decorators(function: ast.FunctionDef) -> set[str]:
    return {
        name
        for decorator in function.decorator_list
        if (
            name := dotted_name(decorator.func)
            if isinstance(decorator, ast.Call)
            else dotted_name(decorator)
        )
    }


def extract_global_flags(tree: ast.Module) -> list[dict[str, Any]]:
    global_function = next(
        (
            node
            for node in tree.body
            if isinstance(node, ast.FunctionDef) and node.name == "global_flags"
        ),
        None,
    )
    if global_function is None:
        raise ContractError("src/omm/cli.py has no global_flags() function")

    result: list[dict[str, Any]] = []
    for node in ast.walk(global_function):
        if not isinstance(node, ast.Call) or dotted_name(node.func) != "inspect.Parameter":
            continue
        if not node.args or not isinstance(node.args[0], ast.Constant):
            continue
        parameter = node.args[0].value
        default_node = next(
            (keyword.value for keyword in node.keywords if keyword.arg == "default"), None
        )
        option_call = next(
            (
                child
                for child in ast.walk(node)
                if isinstance(child, ast.Call) and dotted_name(child.func) == "typer.Option"
            ),
            None,
        )
        if option_call is None:
            continue
        # An Option inside Annotated has no positional default. inspect.Parameter
        # owns the real default value.
        flags = [
            value
            for arg in option_call.args
            if isinstance((value := constant_value(arg)), str) and value.startswith("-")
        ]
        result.append(
            {
                "parameter": parameter,
                "kind": "option",
                "flags": flags,
                "default": default_contract(default_node),
            }
        )

    if not result:
        raise ContractError("global_flags() contains no inspect.Parameter options")
    return result


def extract_string_set(tree: ast.Module, assignment_name: str) -> list[str]:
    for node in tree.body:
        if not isinstance(node, (ast.Assign, ast.AnnAssign)):
            continue
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        if not any(isinstance(target, ast.Name) and target.id == assignment_name for target in targets):
            continue
        value = node.value
        if not isinstance(value, (ast.Set, ast.List, ast.Tuple)):
            raise ContractError(f"{assignment_name} is not a literal collection")
        return sorted(
            item.value
            for item in value.elts
            if isinstance(item, ast.Constant) and isinstance(item.value, str)
        )
    raise ContractError(f"src/omm/cli.py has no {assignment_name} assignment")


def extract_auto_help(tree: ast.Module) -> bool:
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if not any(isinstance(target, ast.Name) and target.id == "app" for target in node.targets):
            continue
        if not isinstance(node.value, ast.Call) or dotted_name(node.value.func) != "typer.Typer":
            raise ContractError("app is not initialized with typer.Typer()")
        for keyword in node.value.keywords:
            if keyword.arg == "add_help_option":
                return bool(constant_value(keyword.value))
        return True
    raise ContractError("src/omm/cli.py has no app = typer.Typer(...) assignment")


def extract_contract(source_root: Path) -> dict[str, Any]:
    cli_path = source_root / "src/omm/cli.py"
    pyproject_path = source_root / "pyproject.toml"
    if not cli_path.is_file() or not pyproject_path.is_file():
        raise ContractError(
            f"{source_root} is not an omm source checkout: expected pyproject.toml and src/omm/cli.py"
        )

    try:
        tree = ast.parse(cli_path.read_text(encoding="utf-8"), filename=str(cli_path))
    except (OSError, SyntaxError) as error:
        raise ContractError(f"could not parse {cli_path}: {error}") from error

    functions = {
        node.name: node for node in tree.body if isinstance(node, ast.FunctionDef)
    }
    commands: dict[str, Any] = {}
    for slug, function_name in COMMAND_FUNCTIONS.items():
        function = functions.get(function_name)
        if function is None:
            raise ContractError(f"documented command {slug!r} has no function {function_name}()")
        names = decorators(function)
        if "global_flags" not in names:
            raise ContractError(f"{function_name}() is no longer decorated with @global_flags")
        if not any(name.endswith(".command") for name in names):
            raise ContractError(f"{function_name}() is no longer a Typer command")
        commands[slug] = {
            "function": function_name,
            "line": function.lineno,
            "parameters": function_parameters(function),
        }

    return {
        "commands": commands,
        "globalFlags": extract_global_flags(tree),
        "capabilities": {
            "json": extract_string_set(tree, "_JSON_CAPABLE"),
            "yes": extract_string_set(tree, "_YES_CAPABLE"),
        },
        "autoHelp": extract_auto_help(tree),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_root", type=Path)
    args = parser.parse_args()
    try:
        contract = extract_contract(args.source_root.resolve())
    except ContractError as error:
        print(f"command-doc source extraction failed: {error}", file=sys.stderr)
        return 2
    json.dump(contract, sys.stdout, ensure_ascii=False, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
