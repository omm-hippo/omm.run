import fs from "node:fs";
import path from "node:path";

import ts from "typescript";

export const COMMAND_ORDER = [
  "search",
  "install",
  "run",
  "recommend",
  "contribute",
  "setup",
];

const EXPECTED_LOCAL_PARAMETERS = {
  search: [
    ["query", "<query>", "required", { kind: "required" }],
    ["skip_unfit", null, "off", { kind: "constant", value: false }],
    ["limit", null, "no limit", { kind: "constant", value: null }],
    ["provider", null, "all three", { kind: "constant", value: null }],
    ["skip_ms", null, "off", { kind: "constant", value: false }],
  ],
  install: [
    ["model_name", "<name>", "required", { kind: "required" }],
    ["skip_unfit", null, "off", { kind: "constant", value: false }],
    ["upload", null, "current upload policy", { kind: "constant", value: null }],
    ["force", null, "off", { kind: "constant", value: false }],
    ["verify_runtime", null, "asks first", { kind: "constant", value: null }],
  ],
  run: [
    ["model_name", "[name]", "picks interactively", { kind: "constant", value: null }],
    ["engine", null, "auto-picks a linked engine", { kind: "constant", value: null }],
  ],
  recommend: [],
  contribute: [
    ["report_errors", null, "off", { kind: "constant", value: false }],
  ],
  setup: [],
};

const EXPECTED_GLOBAL_PARAMETERS = [
  ["json_flag", ["--json"], "off", { kind: "constant", value: false }],
  ["yes_flag", ["--yes", "-y"], "off", { kind: "constant", value: false }],
  ["quiet_flag", ["--quiet", "-q"], "off", { kind: "constant", value: false }],
  ["no_color_flag", ["--no-color"], "off", { kind: "constant", value: false }],
];

const EXPECTED_CAPABILITIES = {
  json: new Set(["search", "recommend"]),
  yes: new Set(["install", "recommend", "contribute"]),
};

function unwrapExpression(node) {
  let current = node;
  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  const name = node.name;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  throw new Error(`unsupported property name in command docs: ${name.getText()}`);
}

function objectProperties(node) {
  const object = unwrapExpression(node);
  if (!ts.isObjectLiteralExpression(object)) {
    throw new Error(`expected an object literal, got ${object.getText().slice(0, 80)}`);
  }
  return new Map(
    object.properties
      .filter(ts.isPropertyAssignment)
      .map((property) => [propertyName(property), property.initializer]),
  );
}

function stringValue(node, label) {
  if (!node) throw new Error(`${label} is missing`);
  const value = unwrapExpression(node);
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
    return value.text;
  }
  throw new Error(`${label} must be a string literal`);
}

function arrayValue(node, label) {
  if (!node) throw new Error(`${label} is missing`);
  const value = unwrapExpression(node);
  if (!ts.isArrayLiteralExpression(value)) {
    throw new Error(`${label} must be an array literal`);
  }
  return value.elements;
}

function findCommandBase(sourceFile) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === "COMMAND_BASE") {
        if (!declaration.initializer) throw new Error("COMMAND_BASE has no initializer");
        return declaration.initializer;
      }
    }
  }
  throw new Error("src/i18n/commands/base.ts has no COMMAND_BASE declaration");
}

export function parseCommandDocs(basePath) {
  const sourceText = fs.readFileSync(basePath, "utf8");
  const sourceFile = ts.createSourceFile(
    basePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const commandProperties = objectProperties(findCommandBase(sourceFile));
  const commands = {};

  for (const slug of COMMAND_ORDER) {
    const commandNode = commandProperties.get(slug);
    if (!commandNode) throw new Error(`COMMAND_BASE is missing ${slug}`);
    const command = objectProperties(commandNode);
    const options = arrayValue(command.get("options"), `${slug}.options`).map((node, index) => {
      const option = objectProperties(node);
      return {
        name: stringValue(option.get("name"), `${slug}.options[${index}].name`),
        default: stringValue(option.get("default"), `${slug}.options[${index}].default`),
      };
    });
    const trouble = arrayValue(command.get("trouble"), `${slug}.trouble`).map((node, index) => {
      const entry = objectProperties(node);
      return {
        see: stringValue(entry.get("see"), `${slug}.trouble[${index}].see`),
        source: stringValue(entry.get("source"), `${slug}.trouble[${index}].source`),
        sourceAnchor: stringValue(
          entry.get("sourceAnchor"),
          `${slug}.trouble[${index}].sourceAnchor`,
        ),
      };
    });
    commands[slug] = { options, trouble };
  }

  return { commands };
}

function flagTokens(label) {
  return label.match(/--?[a-z0-9][a-z0-9-]*/gi) ?? [];
}

function expandSourceFlags(flags) {
  return flags.flatMap((flag) => flag.match(/--?[a-z0-9][a-z0-9-]*/gi) ?? []);
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function formatValue(value) {
  return JSON.stringify(value);
}

function expectedRows(slug, sourceCommand, globalFlags, autoHelp, errors) {
  const localSpec = EXPECTED_LOCAL_PARAMETERS[slug];
  const sourceParameters = sourceCommand.parameters;
  const expectedNames = localSpec.map(([name]) => name);
  const sourceNames = sourceParameters.map(({ parameter }) => parameter);
  if (!sameJson(sourceNames, expectedNames)) {
    errors.push(
      `${slug}: upstream parameter list changed: expected ${formatValue(expectedNames)}, got ${formatValue(sourceNames)}`,
    );
  }

  const rows = [];
  for (const [index, [parameter, argumentLabel, displayDefault, sourceDefault]] of localSpec.entries()) {
    const source = sourceParameters[index];
    if (!source) continue;
    if (!sameJson(source.default, sourceDefault)) {
      errors.push(
        `${slug}.${parameter}: upstream default changed: expected ${formatValue(sourceDefault)}, got ${formatValue(source.default)}`,
      );
    }
    rows.push({
      source: `${slug}.${parameter}`,
      name: argumentLabel,
      flags: argumentLabel ? null : expandSourceFlags(source.flags),
      default: displayDefault,
    });
  }

  const expectedGlobalNames = EXPECTED_GLOBAL_PARAMETERS.map(([name]) => name);
  const actualGlobalNames = globalFlags.map(({ parameter }) => parameter);
  if (!sameJson(actualGlobalNames, expectedGlobalNames)) {
    errors.push(
      `global flags changed: expected ${formatValue(expectedGlobalNames)}, got ${formatValue(actualGlobalNames)}`,
    );
  }
  for (const [index, [parameter, expectedFlags, displayDefault, sourceDefault]] of EXPECTED_GLOBAL_PARAMETERS.entries()) {
    const source = globalFlags[index];
    if (!source) continue;
    const actualFlags = expandSourceFlags(source.flags);
    if (!sameJson(actualFlags, expectedFlags)) {
      errors.push(
        `global ${parameter}: aliases changed: expected ${formatValue(expectedFlags)}, got ${formatValue(actualFlags)}`,
      );
    }
    if (!sameJson(source.default, sourceDefault)) {
      errors.push(
        `global ${parameter}: default changed: expected ${formatValue(sourceDefault)}, got ${formatValue(source.default)}`,
      );
    }
    rows.push({
      source: `global ${parameter}`,
      name: null,
      flags: actualFlags,
      default: displayDefault,
    });
  }

  if (autoHelp) {
    rows.push({ source: "Typer auto help", name: null, flags: ["--help"], default: "off" });
  }
  return rows;
}

function verifyCapabilities(upstream, errors) {
  for (const [capability, expectedSet] of Object.entries(EXPECTED_CAPABILITIES)) {
    const actualSet = new Set(upstream.capabilities[capability] ?? []);
    for (const slug of COMMAND_ORDER) {
      if (actualSet.has(slug) !== expectedSet.has(slug)) {
        errors.push(
          `${slug}: upstream --${capability} behavior changed; update the option description before publishing`,
        );
      }
    }
  }
}

function verifySourceCitations(docs, sourceRoot, errors) {
  const citationPattern = /^(?<file>src\/omm\/[a-z0-9_]+\.py):(?<start>\d+)(?:-(?<end>\d+))?$/i;
  for (const slug of COMMAND_ORDER) {
    for (const [index, trouble] of docs.commands[slug].trouble.entries()) {
      const match = trouble.source.match(citationPattern);
      if (!match?.groups) {
        errors.push(`${slug}.trouble[${index}]: invalid source citation ${formatValue(trouble.source)}`);
        continue;
      }
      const start = Number(match.groups.start);
      const end = Number(match.groups.end ?? match.groups.start);
      if (start < 1 || end < start) {
        errors.push(`${slug}.trouble[${index}]: invalid source line range ${trouble.source}`);
        continue;
      }
      const sourcePath = path.join(sourceRoot, match.groups.file);
      if (!fs.existsSync(sourcePath)) {
        errors.push(`${slug}.trouble[${index}]: source file does not exist: ${match.groups.file}`);
        continue;
      }
      const lines = fs.readFileSync(sourcePath, "utf8").split(/\r?\n/);
      if (end > lines.length) {
        errors.push(
          `${slug}.trouble[${index}]: ${trouble.source} exceeds ${match.groups.file}'s ${lines.length} lines`,
        );
        continue;
      }
      const snippet = lines.slice(start - 1, end).join("\n");
      if (!snippet.includes(trouble.sourceAnchor)) {
        errors.push(
          `${slug}.trouble[${index}]: ${trouble.source} no longer contains sourceAnchor ${formatValue(trouble.sourceAnchor)}`,
        );
      }
      if (!trouble.see.includes(trouble.sourceAnchor)) {
        errors.push(
          `${slug}.trouble[${index}]: rendered message no longer contains sourceAnchor ${formatValue(trouble.sourceAnchor)}`,
        );
      }
    }
  }
}

export function verifyCommandDocs({ docs, upstream, sourceRoot }) {
  const errors = [];

  verifyCapabilities(upstream, errors);
  if (!upstream.autoHelp) {
    errors.push("upstream Typer app disabled the automatic --help flag");
  }

  for (const slug of COMMAND_ORDER) {
    const sourceCommand = upstream.commands[slug];
    if (!sourceCommand) {
      errors.push(`${slug}: missing from extracted upstream contract`);
      continue;
    }
    const expected = expectedRows(
      slug,
      sourceCommand,
      upstream.globalFlags,
      upstream.autoHelp,
      errors,
    );
    const actual = docs.commands[slug].options;
    if (actual.length !== expected.length) {
      errors.push(`${slug}: option row count changed: expected ${expected.length}, got ${actual.length}`);
    }
    const count = Math.min(actual.length, expected.length);
    for (let index = 0; index < count; index += 1) {
      const actualRow = actual[index];
      const expectedRow = expected[index];
      if (expectedRow.name !== null) {
        if (actualRow.name !== expectedRow.name) {
          errors.push(
            `${slug}.options[${index}] (${expectedRow.source}): expected argument label ${formatValue(expectedRow.name)}, got ${formatValue(actualRow.name)}`,
          );
        }
      } else {
        const actualFlags = flagTokens(actualRow.name);
        if (!sameJson(actualFlags, expectedRow.flags)) {
          errors.push(
            `${slug}.options[${index}] (${expectedRow.source}): expected flags ${formatValue(expectedRow.flags)}, got ${formatValue(actualFlags)}`,
          );
        }
      }
      if (actualRow.default !== expectedRow.default) {
        errors.push(
          `${slug}.options[${index}] (${expectedRow.source}): expected displayed default ${formatValue(expectedRow.default)}, got ${formatValue(actualRow.default)}`,
        );
      }
    }
  }

  verifySourceCitations(docs, sourceRoot, errors);
  return errors;
}
