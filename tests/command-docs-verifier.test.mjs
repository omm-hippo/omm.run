import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  COMMAND_ORDER,
  verifyCommandDocs,
} from "../scripts/lib/command-docs-verifier.mjs";

const required = { kind: "required" };
const off = { kind: "constant", value: false };
const none = { kind: "constant", value: null };

function argument(parameter, defaultValue) {
  return { parameter, kind: "argument", flags: [], default: defaultValue };
}

function option(parameter, flags, defaultValue) {
  return { parameter, kind: "option", flags, default: defaultValue };
}

function upstreamFixture() {
  return {
    commands: {
      search: {
        parameters: [
          argument("query", required),
          option("skip_unfit", ["--skip-unfit"], off),
          option("limit", ["--limit"], none),
          option("provider", ["--provider"], none),
          option("skip_ms", ["--skip-ms"], off),
        ],
      },
      install: {
        parameters: [
          argument("model_name", required),
          option("skip_unfit", ["--skip-unfit"], off),
          option("upload", ["--upload/--no-upload"], none),
          option("force", ["--force"], off),
          option("verify_runtime", ["--verify-runtime/--no-verify-runtime"], none),
        ],
      },
      run: {
        parameters: [
          argument("model_name", none),
          option("engine", ["--engine", "-e"], none),
        ],
      },
      recommend: { parameters: [] },
      contribute: { parameters: [option("report_errors", ["--report-errors"], off)] },
      setup: { parameters: [] },
    },
    globalFlags: [
      option("json_flag", ["--json"], off),
      option("yes_flag", ["--yes", "-y"], off),
      option("quiet_flag", ["--quiet", "-q"], off),
      option("no_color_flag", ["--no-color"], off),
    ],
    capabilities: {
      json: ["search", "recommend"],
      yes: ["install", "recommend", "contribute"],
    },
    autoHelp: true,
  };
}

const globalRows = [
  { name: "--json", default: "off" },
  { name: "--yes, -y", default: "off" },
  { name: "--quiet, -q", default: "off" },
  { name: "--no-color", default: "off" },
  { name: "--help", default: "off" },
];

function docsFixture() {
  const local = {
    search: [
      { name: "<query>", default: "required" },
      { name: "--skip-unfit", default: "off" },
      { name: "--limit", default: "no limit" },
      { name: "--provider", default: "all three" },
      { name: "--skip-ms", default: "off" },
    ],
    install: [
      { name: "<name>", default: "required" },
      { name: "--skip-unfit", default: "off" },
      { name: "--upload / --no-upload", default: "current upload policy" },
      { name: "--force", default: "off" },
      { name: "--verify-runtime / --no-verify-runtime", default: "asks first" },
    ],
    run: [
      { name: "[name]", default: "picks interactively" },
      { name: "--engine, -e", default: "auto-picks a linked engine" },
    ],
    recommend: [],
    contribute: [{ name: "--report-errors", default: "off" }],
    setup: [],
  };
  return {
    commands: Object.fromEntries(
      COMMAND_ORDER.map((slug) => [
        slug,
        { options: [...local[slug], ...globalRows], trouble: [] },
      ]),
    ),
  };
}

function temporarySourceRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "omm-command-doc-test-"));
  fs.mkdirSync(path.join(root, "src/omm"), { recursive: true });
  return root;
}

test("AST extractor recognizes called @app.command() decorators", () => {
  const sourceRoot = temporarySourceRoot();
  fs.writeFileSync(path.join(sourceRoot, "pyproject.toml"), '[project]\nname = "omm"\n', "utf8");
  fs.writeFileSync(
    path.join(sourceRoot, "src/omm/cli.py"),
    `
_JSON_CAPABLE = {"search", "recommend"}
_YES_CAPABLE = {"install", "recommend", "contribute"}
app = typer.Typer()

def global_flags(func):
    new_params = [
        inspect.Parameter("json_flag", inspect.Parameter.KEYWORD_ONLY, default=False,
            annotation=Annotated[bool, typer.Option("--json")]),
        inspect.Parameter("yes_flag", inspect.Parameter.KEYWORD_ONLY, default=False,
            annotation=Annotated[bool, typer.Option("--yes", "-y")]),
        inspect.Parameter("quiet_flag", inspect.Parameter.KEYWORD_ONLY, default=False,
            annotation=Annotated[bool, typer.Option("--quiet", "-q")]),
        inspect.Parameter("no_color_flag", inspect.Parameter.KEYWORD_ONLY, default=False,
            annotation=Annotated[bool, typer.Option("--no-color")]),
    ]
    return func

@app.command()
@global_flags
def search(query: str, skip_unfit: bool = typer.Option(False, "--skip-unfit"),
           limit: int = typer.Option(None, "--limit"),
           provider: str = typer.Option(None, "--provider"),
           skip_ms: bool = typer.Option(False, "--skip-ms")):
    pass

@app.command()
@global_flags
def install(model_name: str = typer.Argument(...),
            skip_unfit: bool = typer.Option(False, "--skip-unfit"),
            upload: bool = typer.Option(None, "--upload/--no-upload"),
            force: bool = typer.Option(False, "--force"),
            verify_runtime: bool = typer.Option(None, "--verify-runtime/--no-verify-runtime")):
    pass

@app.command()
@global_flags
def run(model_name: str = typer.Argument(None),
        engine: str = typer.Option(None, "--engine", "-e")):
    pass

@app.command()
@global_flags
def recommend():
    pass

@app.command()
@global_flags
def contribute(report_errors: bool = typer.Option(False, "--report-errors")):
    pass

@app.command(name="setup")
@global_flags
def setup_cmd():
    pass
`,
    "utf8",
  );
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const result = spawnSync(
    process.env.PYTHON ?? "python3",
    [path.resolve(testDir, "../scripts/extract-omm-command-contract.py"), sourceRoot],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const extracted = JSON.parse(result.stdout);
  assert.equal(extracted.commands.search.function, "search");
  assert.deepEqual(extracted.commands.run.parameters[1].flags, ["--engine", "-e"]);
});

test("accepts the complete source-derived command contract", () => {
  const sourceRoot = temporarySourceRoot();
  assert.deepEqual(
    verifyCommandDocs({ docs: docsFixture(), upstream: upstreamFixture(), sourceRoot }),
    [],
  );
});

test("reports a removed short alias with the command and row", () => {
  const sourceRoot = temporarySourceRoot();
  const upstream = upstreamFixture();
  upstream.commands.run.parameters[1].flags = ["--engine"];
  const errors = verifyCommandDocs({ docs: docsFixture(), upstream, sourceRoot });
  assert(errors.some((error) => error.includes("run.options[1]") && error.includes("--engine")));
});

test("reports an upstream parameter addition instead of silently accepting stale docs", () => {
  const sourceRoot = temporarySourceRoot();
  const upstream = upstreamFixture();
  upstream.commands.search.parameters.push(option("fresh", ["--fresh"], off));
  const errors = verifyCommandDocs({ docs: docsFixture(), upstream, sourceRoot });
  assert(errors.some((error) => error.includes("search: upstream parameter list changed")));
});

test("reports capability changes that require prose updates", () => {
  const sourceRoot = temporarySourceRoot();
  const upstream = upstreamFixture();
  upstream.capabilities.json.push("run");
  const errors = verifyCommandDocs({ docs: docsFixture(), upstream, sourceRoot });
  assert(errors.some((error) => error.includes("run: upstream --json behavior changed")));
});

test("reports when a cited line no longer contains its stable message anchor", () => {
  const sourceRoot = temporarySourceRoot();
  fs.writeFileSync(path.join(sourceRoot, "src/omm/cli.py"), "a different error\n", "utf8");
  const docs = docsFixture();
  docs.commands.search.trouble.push({
    see: "No models found matching 'missing'.",
    source: "src/omm/cli.py:1",
    sourceAnchor: "No models found matching",
  });
  const errors = verifyCommandDocs({ docs, upstream: upstreamFixture(), sourceRoot });
  assert(errors.some((error) => error.includes("no longer contains sourceAnchor")));
});
