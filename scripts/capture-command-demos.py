#!/usr/bin/env python3
"""Capture safe, reproducible OMM command demos from the real CLI process.

The capture runs from a disposable HOME/OMM_HOME and an isolated virtualenv.
No model, runner, or telemetry operation is entered.  Network access from the
CLI itself is forced through an unused loopback proxy, while the demo source is
either a caller-provided clean clone or a fresh clone of omm-hippo/omm.
"""

from __future__ import annotations

import argparse
import codecs
import fcntl
import hashlib
import json
import math
import os
import pty
import re
import select
import shlex
import shutil
import struct
import subprocess
import sys
import tempfile
import termios
import threading
import time
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Iterator


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "demos" / "commands"
SOURCE_REPOSITORY = "https://github.com/omm-hippo/omm.git"
WIDTH = 1280
HEIGHT = 720
MAX_VISIBLE_LINES = 24
FONT_PATH = Path("/System/Library/Fonts/Menlo.ttc")


ANSI_RE = re.compile(
    r"(?:\x1B\[[0-?]*[ -/]*[@-~]|\x1B\][^\x07]*(?:\x07|\x1B\\))"
)
CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


@dataclass(frozen=True)
class InputStep:
    pattern: str
    response: bytes
    label: str


@dataclass(frozen=True)
class Demo:
    slug: str
    argv: tuple[str, ...]
    expected_exit_code: int
    outcome: str
    safety_path: str
    input_steps: tuple[InputStep, ...] = ()
    context_label: str = "real CLI capture"
    fixture: str | None = None

    @property
    def command(self) -> str:
        return shlex.join(("omm", *self.argv))


DEMOS = (
    Demo(
        "search",
        ("search", "llama", "--skip-ms", "--limit", "4", "--no-color"),
        0,
        "success",
        "Read-only search against the built-in catalog and catalog copied from the exact source commit. "
        "All CLI outbound HTTP(S) is routed to an unused loopback proxy, so live "
        "Hugging Face, ModelScope, omm.run, and Workers endpoints are not reached.",
    ),
    Demo(
        "install",
        (
            "install",
            "hf:example/oversized-405b-gguf:oversized-405b-q4_k_m.gguf",
            "--no-color",
        ),
        0,
        "cancelled",
        "A syntactically valid but deliberately non-published 405B fixture reference "
        "reaches OMM's real hardware-fit warning. The captured 'n' response cancels "
        "before provider metadata, downloader, checksum, linking, or runtime code.",
        (InputStep("Install anyway?", b"n\r", "n - cancel at hardware-fit warning"),),
        "fixture ref · cancelled before download",
        "Syntactically valid example/oversized-405b reference; no remote model is claimed to exist.",
    ),
    Demo(
        "run",
        ("run", "--no-color"),
        1,
        "cancelled",
        "Two metadata-only model names are placed in the isolated registry to exercise "
        "the real model picker. Escape cancels before engine selection or launcher code.",
        (InputStep("Which model do you want to run?", b"\x1b", "Escape - cancel model picker"),),
        "metadata fixture · cancelled before launch",
        "Two isolated registry names only; no model files, engine links, or runnable weights exist.",
    ),
    Demo(
        "recommend",
        ("recommend", "--json", "--no-color"),
        0,
        "success",
        "JSON mode is read-only and never enters the interactive installer. The "
        "recommendation artifact is copied from the exact source commit and remote "
        "model/rules URLs are disabled in the isolated config.",
    ),
    Demo(
        "contribute",
        ("contribute", "--no-color"),
        0,
        "cancelled",
        "A temporary empty loopback Ollama API fixture permits only GET /api/tags so "
        "the real safety notice can render. The captured 'n' response cancels at "
        "'Start contributing compute now?' before downloads, benchmarks, model "
        "execution, deletion, POST requests, or uploads.",
        (InputStep("Start contributing compute now?", b"n\r", "n - cancel before compute"),),
        "empty local API fixture · cancelled before compute",
        "Temporary GET-only loopback API on 127.0.0.1:11434; capture aborts if the port is occupied or any POST occurs.",
    ),
    Demo(
        "setup",
        ("setup", "--no-color"),
        1,
        "cancelled",
        "A pseudo-TTY accepts the recommended theme, renders the real hardware summary "
        "and engine checklist, then sends Escape. No engine is selected and the installer "
        "is never entered.",
        (
            InputStep("Pick a color theme for omm's output:", b"\r", "Enter - accept recommended theme"),
            InputStep("Install any local AI runners you'd like to use?", b"\x1b", "Escape - cancel engine checklist"),
        ),
        "interactive wizard · cancelled before install",
    ),
)


def run(
    argv: list[str],
    *,
    cwd: Path | None = None,
    env: dict[str, str] | None = None,
    capture: bool = False,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        argv,
        cwd=cwd,
        env=env,
        stdin=subprocess.DEVNULL,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
        check=False,
    )


def require_tools() -> None:
    missing = [name for name in ("git", "uv", "magick", "ffmpeg", "ffprobe") if not shutil.which(name)]
    if missing:
        raise SystemExit(f"Missing required local tools: {', '.join(missing)}")
    if not FONT_PATH.is_file():
        raise SystemExit(f"Required terminal font is missing: {FONT_PATH}")


def source_checkout(workspace: Path) -> tuple[Path, str, str]:
    provided = os.environ.get("OMM_DEMO_SOURCE")
    if provided:
        source = Path(provided).expanduser().resolve()
        if not (source / ".git").exists():
            raise SystemExit(f"OMM_DEMO_SOURCE is not a Git checkout: {source}")
        dirty = run(["git", "status", "--porcelain"], cwd=source, capture=True)
        if dirty.returncode != 0 or (dirty.stdout or "").strip():
            raise SystemExit("OMM_DEMO_SOURCE must be a clean checkout for reproducible provenance")
        commit = checked_output(["git", "rev-parse", "HEAD"], cwd=source)
        remote = checked_output(["git", "remote", "get-url", "origin"], cwd=source)
        return source, commit, remote

    source = workspace / "omm-source"
    ref = os.environ.get("OMM_DEMO_REF", "main")
    for argv in (
        ["git", "init", "--quiet", str(source)],
        ["git", "-C", str(source), "remote", "add", "origin", SOURCE_REPOSITORY],
        ["git", "-C", str(source), "fetch", "--quiet", "--depth", "1", "origin", ref],
        ["git", "-C", str(source), "checkout", "--quiet", "--detach", "FETCH_HEAD"],
    ):
        result = run(argv)
        if result.returncode != 0:
            raise SystemExit(f"Source checkout failed: {shlex.join(argv)}")
    commit = checked_output(["git", "rev-parse", "HEAD"], cwd=source)
    return source, commit, SOURCE_REPOSITORY


def checked_output(argv: list[str], *, cwd: Path | None = None) -> str:
    result = run(argv, cwd=cwd, capture=True)
    if result.returncode != 0:
        raise SystemExit(f"Command failed ({result.returncode}): {shlex.join(argv)}\n{result.stdout}")
    return (result.stdout or "").strip()


def project_version(source: Path) -> str:
    content = (source / "pyproject.toml").read_text(encoding="utf-8")
    match = re.search(r'^version\s*=\s*"([^"]+)"', content, re.MULTILINE)
    if not match:
        raise SystemExit("Could not read OMM version from pyproject.toml")
    return match.group(1)


def prepare_runtime(workspace: Path, source: Path, commit: str) -> tuple[Path, Path, dict[str, str]]:
    venv = workspace / "venv"
    capture_libraries = workspace / "capture-libraries"
    uv_env = {**os.environ, "UV_CACHE_DIR": str(workspace / "uv-cache")}
    python_request = os.environ.get("OMM_DEMO_PYTHON", ">=3.10")
    for argv in (
        ["uv", "venv", "--quiet", str(venv), "--python", python_request],
        ["uv", "pip", "install", "--quiet", "--python", str(venv / "bin" / "python"), "-e", str(source)],
        ["uv", "pip", "install", "--quiet", "--target", str(capture_libraries), "pyte==0.8.2"],
    ):
        result = run(argv, env=uv_env)
        if result.returncode != 0:
            raise SystemExit(f"Isolated runtime setup failed: {shlex.join(argv)}")
    sys.path.insert(0, str(capture_libraries))

    demo_home = workspace / "home"
    omm_home = demo_home / ".omm-demo"
    omm_home.mkdir(parents=True)
    config = {
        "telemetry_send_policy": "never",
        "telemetry_endpoint": None,
        "telemetry_backend": "local",
        "error_report_send_policy": "never",
        "rules_url": None,
        "model_url": None,
        "catalog_manifest_url": None,
        "catalog_public_key": "offline-demo",
        "default_engine": None,
        "external_scan_done": True,
        "onboarding_completed": True,
        "contribute_always_ack": False,
        "update_channel": "stable",
        "theme": "dark",
    }
    (omm_home / "config.json").write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")

    published_catalog = source / "published" / "localfit-recommend-model.json"
    if not published_catalog.is_file():
        raise SystemExit(f"Published recommendation catalog is missing: {published_catalog}")
    shutil.copyfile(published_catalog, omm_home / "recommend-model.json")

    update_cache = {
        "main": {
            "checked_at": time.time(),
            "remote_head": commit,
        }
    }
    (omm_home / "update_check.json").write_text(
        json.dumps(update_cache, indent=2) + "\n", encoding="utf-8"
    )

    dead_proxy = "http://127.0.0.1:9"
    env = {
        "PATH": os.pathsep.join(
            [
                str(venv / "bin"),
                "/opt/homebrew/bin",
                "/usr/local/bin",
                "/usr/bin",
                "/bin",
                "/usr/sbin",
                "/sbin",
            ]
        ),
        "HOME": str(demo_home),
        "OMM_HOME": str(omm_home),
        "XDG_CACHE_HOME": str(workspace / "xdg-cache"),
        "TMPDIR": str(workspace / "tmp"),
        "NO_COLOR": "1",
        "TERM": "dumb",
        "COLUMNS": "96",
        "LINES": "28",
        "LANG": "en_US.UTF-8",
        "LC_ALL": "en_US.UTF-8",
        "HTTP_PROXY": dead_proxy,
        "HTTPS_PROXY": dead_proxy,
        "ALL_PROXY": dead_proxy,
        "http_proxy": dead_proxy,
        "https_proxy": dead_proxy,
        "all_proxy": dead_proxy,
        "NO_PROXY": "",
        "no_proxy": "",
        "PYTHONUNBUFFERED": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
    }
    (workspace / "tmp").mkdir()
    return venv, omm_home, env


def normalize_transcript(raw: str, replacements: dict[str, str]) -> str:
    text = raw.replace("\r\n", "\n").replace("\r", "\n")
    for original, placeholder in sorted(replacements.items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(original, placeholder)
    text = ANSI_RE.sub("", text)
    text = CONTROL_RE.sub("", text)
    lines = [line.rstrip() for line in text.splitlines()]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines) + "\n"


def replacement_map(env: dict[str, str], workspace: Path) -> dict[str, str]:
    replacements: dict[str, str] = {}
    for key in ("OMM_HOME", "HOME", "TMPDIR", "XDG_CACHE_HOME"):
        value = env[key]
        replacements[value] = f"${key}"
        replacements[str(Path(value).resolve())] = f"${key}"
    replacements[str(workspace)] = "$CAPTURE_ROOT"
    replacements[str(workspace.resolve())] = "$CAPTURE_ROOT"
    return replacements


def replace_paths(text: str, replacements: dict[str, str]) -> str:
    for original, placeholder in sorted(replacements.items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(original, placeholder)
    return text


class _FixtureHandler(BaseHTTPRequestHandler):
    requests_seen: list[tuple[str, str]] = []

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler contract
        self.requests_seen.append(("GET", self.path))
        if self.path == "/api/tags":
            payload = {"models": []}
        elif self.path == "/api/ps":
            payload = {"models": []}
        elif self.path == "/api/version":
            payload = {"version": "0.0.0-empty-capture-fixture"}
        else:
            self.send_response(404)
            self.end_headers()
            return
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self) -> None:  # noqa: N802 - reject every state-changing/runtime path
        self.requests_seen.append(("POST", self.path))
        self.send_response(409)
        self.end_headers()

    def log_message(self, _format: str, *args: object) -> None:
        return


@contextmanager
def demo_fixture(
    demo: Demo, env: dict[str, str], omm_home: Path
) -> Iterator[tuple[dict[str, str], dict[str, object] | None]]:
    demo_env = dict(env)
    config_path = omm_home / "config.json"
    registry_path = omm_home / "models.json"
    original_config = config_path.read_bytes()
    original_registry = registry_path.read_bytes() if registry_path.exists() else None
    server: ThreadingHTTPServer | None = None
    server_thread: threading.Thread | None = None
    fixture_record: dict[str, object] | None = (
        {"description": demo.fixture} if demo.fixture is not None else None
    )
    try:
        if demo.slug == "run":
            registry_path.write_text(
                json.dumps(
                    {
                        "fixture-alpha.gguf": {"linked": {}},
                        "fixture-beta.gguf": {"linked": {}},
                    },
                    indent=2,
                )
                + "\n",
                encoding="utf-8",
            )
            fixture_record = {
                "description": demo.fixture,
                "kind": "metadata-only isolated registry",
                "entries": ["fixture-alpha.gguf", "fixture-beta.gguf"],
                "modelFilesCreated": False,
            }
        elif demo.slug == "contribute":
            config = json.loads(original_config)
            config.update(
                telemetry_send_policy="ask",
                telemetry_endpoint=None,
                telemetry_backend="local",
                error_report_send_policy="never",
            )
            config_path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
            registry_path.write_text("{}\n", encoding="utf-8")
            _FixtureHandler.requests_seen = []
            try:
                server = ThreadingHTTPServer(("127.0.0.1", 11434), _FixtureHandler)
            except OSError as error:
                raise SystemExit(
                    "contribute fixture requires unused 127.0.0.1:11434; refusing to "
                    f"contact or replace an existing runtime ({error})"
                ) from error
            server.daemon_threads = True
            server_thread = threading.Thread(target=server.serve_forever, daemon=True)
            server_thread.start()
            demo_env["NO_PROXY"] = "localhost,127.0.0.1"
            demo_env["no_proxy"] = "localhost,127.0.0.1"
            fixture_record = {
                "description": demo.fixture,
                "kind": "empty GET-only loopback Ollama API",
                "address": "127.0.0.1:11434",
                "allowedRequests": ["GET /api/tags", "GET /api/ps", "GET /api/version"],
            }
        yield demo_env, fixture_record
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
            if server_thread is not None:
                server_thread.join(timeout=2)
            unexpected = [
                request
                for request in _FixtureHandler.requests_seen
                if request[0] != "GET"
                or request[1] not in {"/api/tags", "/api/ps", "/api/version"}
            ]
            if fixture_record is not None:
                fixture_record["requestsObserved"] = [
                    f"{method} {path}" for method, path in _FixtureHandler.requests_seen
                ]
                fixture_record["postRequestsObserved"] = sum(
                    method == "POST" for method, _path in _FixtureHandler.requests_seen
                )
            if unexpected:
                raise SystemExit(
                    f"contribute fixture observed forbidden runtime requests: {unexpected}"
                )
        config_path.write_bytes(original_config)
        if original_registry is None:
            registry_path.unlink(missing_ok=True)
        else:
            registry_path.write_bytes(original_registry)


def terminal_screen_lines(screen: object, replacements: dict[str, str]) -> list[str]:
    lines = [replace_paths(line.rstrip(), replacements) for line in screen.display]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return lines


def capture_interactive(
    demo: Demo,
    env: dict[str, str],
    workspace: Path,
    replacements: dict[str, str],
) -> tuple[int, str, list[list[str]], list[str]]:
    import pyte

    columns, rows = 96, 22
    interactive_env = {**env, "TERM": "xterm-256color", "COLUMNS": str(columns), "LINES": str(rows)}
    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack("HHHH", rows, columns, 0, 0))
    process = subprocess.Popen(
        ["omm", *demo.argv],
        cwd=workspace,
        env=interactive_env,
        stdin=slave,
        stdout=slave,
        stderr=slave,
        close_fds=True,
    )
    os.close(slave)
    screen = pyte.Screen(columns, rows)
    stream = pyte.Stream(screen)
    decoder = codecs.getincrementaldecoder("utf-8")("replace")
    raw = bytearray()
    snapshots: list[list[str]] = []
    sent_labels: list[str] = []
    next_step = 0
    cpr_answered = False
    deadline = time.monotonic() + 30
    try:
        while time.monotonic() < deadline:
            readable, _, _ = select.select([master], [], [], 0.1)
            if readable:
                try:
                    chunk = os.read(master, 65_536)
                except OSError:
                    break
                if not chunk:
                    break
                raw.extend(chunk)
                stream.feed(decoder.decode(chunk))
                if not cpr_answered and b"\x1b[6n" in chunk:
                    # prompt_toolkit asks a real terminal for the cursor position
                    # before accepting keys. Answer as a minimal VT100 terminal so
                    # the scripted input is not consumed as the CPR response.
                    os.write(master, b"\x1b[1;1R")
                    cpr_answered = True
                    continue
                current = terminal_screen_lines(screen, replacements)
                if current and (not snapshots or current != snapshots[-1]):
                    snapshots.append(current)
                if next_step < len(demo.input_steps):
                    step = demo.input_steps[next_step]
                    if step.pattern.encode("utf-8") in raw:
                        os.write(master, step.response)
                        sent_labels.append(step.label)
                        next_step += 1
            if process.poll() is not None:
                break
        if process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=2)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=2)
            diagnostic = normalize_transcript(raw.decode("utf-8", "replace"), replacements)
            raise SystemExit(
                f"{demo.slug}: interactive capture timed out after inputs {sent_labels}; "
                f"captured output:\n{diagnostic[-4000:]}"
            )
    finally:
        os.close(master)
    if next_step != len(demo.input_steps):
        missing = [step.pattern for step in demo.input_steps[next_step:]]
        raise SystemExit(f"{demo.slug}: interactive prompt(s) not observed: {missing}")
    if process.returncode != demo.expected_exit_code:
        raise SystemExit(
            f"{demo.slug}: expected exit {demo.expected_exit_code}, got {process.returncode}"
        )
    final_lines = snapshots[-1] if snapshots else []
    transcript = "\n".join(final_lines) + "\n"
    if len(snapshots) > 10:
        indices = sorted({round(index * (len(snapshots) - 1) / 9) for index in range(10)})
        snapshots = [snapshots[index] for index in indices]
    return process.returncode, transcript, snapshots, sent_labels


def capture_demo(
    demo: Demo, env: dict[str, str], workspace: Path, omm_home: Path
) -> tuple[int, str, list[list[str]] | None, list[str], dict[str, object] | None]:
    replacements = replacement_map(env, workspace)
    with demo_fixture(demo, env, omm_home) as (demo_env, fixture_record):
        if demo.input_steps:
            exit_code, transcript, snapshots, input_events = capture_interactive(
                demo, demo_env, workspace, replacements
            )
            return exit_code, transcript, snapshots, input_events, fixture_record
        result = run(["omm", *demo.argv], cwd=workspace, env=demo_env, capture=True)
        transcript = normalize_transcript(result.stdout or "", replacements)
        if result.returncode != demo.expected_exit_code:
            raise SystemExit(
                f"{demo.slug}: expected exit {demo.expected_exit_code}, got {result.returncode}\n{transcript}"
            )
        return result.returncode, transcript, None, [], fixture_record


def visible_lines(command: str, transcript: str) -> list[str]:
    return [f"$ {command}", "", *transcript.rstrip("\n").splitlines()]


def render_png(demo: Demo, lines: list[str], destination: Path) -> None:
    title = f"omm {demo.slug}  ·  {demo.context_label}"
    argv = [
        "magick",
        "-size",
        f"{WIDTH}x{HEIGHT}",
        "xc:#07111B",
        "-fill",
        "#0D1722",
        "-stroke",
        "#243445",
        "-strokewidth",
        "2",
        "-draw",
        "roundrectangle 38,30 1242,690 18,18",
        "-fill",
        "#14202D",
        "-stroke",
        "none",
        "-draw",
        "roundrectangle 38,30 1242,86 18,18",
        "-draw",
        "rectangle 38,68 1242,86",
        "-fill",
        "#FF6B6B",
        "-draw",
        "circle 70,58 77,58",
        "-fill",
        "#FFD166",
        "-draw",
        "circle 94,58 101,58",
        "-fill",
        "#55D187",
        "-draw",
        "circle 118,58 125,58",
        "-font",
        str(FONT_PATH),
        "-fill",
        "#91A4B7",
        "-pointsize",
        "15",
        "-gravity",
        "north",
        "-annotate",
        "+0+48",
        title,
        "-gravity",
        "northwest",
    ]
    y = 128
    for index, line in enumerate(lines):
        color = "#7EE787" if index == 0 and line.startswith("$") else "#D7E1EB"
        argv.extend(
            [
                "-fill",
                color,
                "-pointsize",
                "17",
                "-annotate",
                f"+82+{y}",
                line.expandtabs(4),
            ]
        )
        y += 22
    argv.append(str(destination))
    converted = run(argv, capture=True)
    if converted.returncode != 0:
        raise SystemExit(f"ImageMagick failed for {demo.slug}:\n{converted.stdout}")


def reveal_counts(total: int) -> list[int]:
    if total <= 1:
        return [total]
    counts = [1]
    output_count = total - 1
    steps = min(10, max(4, math.ceil(output_count / 3)))
    for step in range(1, steps + 1):
        counts.append(1 + math.ceil(output_count * step / steps))
    return list(dict.fromkeys(min(total, count) for count in counts))


def render_asset(
    demo: Demo,
    transcript: str,
    frame_root: Path,
    terminal_snapshots: list[list[str]] | None = None,
) -> tuple[Path, Path, Path]:
    all_lines = visible_lines(demo.command, transcript)
    demo_frames = frame_root / demo.slug
    demo_frames.mkdir(parents=True)
    frame_paths: list[Path] = []
    if terminal_snapshots:
        rendered_windows = [
            ([f"$ {demo.command}", "", *snapshot])[-MAX_VISIBLE_LINES:]
            for snapshot in terminal_snapshots
        ]
    else:
        rendered_windows = []
        for count in reveal_counts(len(all_lines)):
            shown = all_lines[:count]
            rendered_windows.append(shown[-MAX_VISIBLE_LINES:])
    for index, window in enumerate(rendered_windows):
        png = demo_frames / f"frame-{index:02d}.png"
        render_png(demo, window, png)
        frame_paths.append(png)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    poster = OUTPUT_DIR / f"{demo.slug}.png"
    poster_lines = all_lines[:MAX_VISIBLE_LINES]
    render_png(demo, poster_lines, poster)

    concat = demo_frames / "frames.ffconcat"
    concat_lines = ["ffconcat version 1.0"]
    for index, frame in enumerate(frame_paths):
        duration = 0.9 if index == 0 else (1.8 if index == len(frame_paths) - 1 else 0.42)
        concat_lines.extend((f"file {frame.as_posix()}", f"duration {duration:.2f}"))
    concat_lines.append(f"file {frame_paths[-1].as_posix()}")
    concat.write_text("\n".join(concat_lines) + "\n", encoding="utf-8")

    video = OUTPUT_DIR / f"{demo.slug}.mp4"
    encoded = run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat),
            "-an",
            "-vf",
            "fps=24,format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "22",
            "-movflags",
            "+faststart",
            str(video),
        ],
        capture=True,
    )
    if encoded.returncode != 0:
        raise SystemExit(f"FFmpeg failed for {demo.slug}:\n{encoded.stdout}")

    transcript_path = OUTPUT_DIR / f"{demo.slug}.txt"
    transcript_path.write_text(f"$ {demo.command}\n\n{transcript}", encoding="utf-8")
    return video, poster, transcript_path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def probe_video(path: Path) -> dict[str, object]:
    result = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=codec_type,codec_name,width,height,pix_fmt",
            "-of",
            "json",
            str(path),
        ],
        capture=True,
    )
    if result.returncode != 0:
        raise SystemExit(f"ffprobe failed for {path.name}:\n{result.stdout}")
    data = json.loads(result.stdout or "{}")
    streams = data.get("streams", [])
    video_streams = [stream for stream in streams if stream.get("codec_type") == "video"]
    audio_streams = [stream for stream in streams if stream.get("codec_type") == "audio"]
    if len(video_streams) != 1 or audio_streams:
        raise SystemExit(f"{path.name}: expected one video stream and no audio streams")
    stream = video_streams[0]
    if (stream.get("width"), stream.get("height"), stream.get("pix_fmt")) != (WIDTH, HEIGHT, "yuv420p"):
        raise SystemExit(f"{path.name}: unexpected video format {stream}")
    duration = float(data["format"]["duration"])
    if not 2.0 <= duration <= 12.0:
        raise SystemExit(f"{path.name}: unexpected duration {duration:.3f}s")
    return {
        "duration": round(duration, 3),
        "codec": stream.get("codec_name"),
        "width": stream.get("width"),
        "height": stream.get("height"),
        "pixelFormat": stream.get("pix_fmt"),
        "audioStreams": 0,
    }


def file_record(path: Path) -> dict[str, object]:
    return {"bytes": path.stat().st_size, "sha256": sha256(path)}


def public_path(value: object) -> Path:
    if not isinstance(value, str) or not value.startswith("/demos/commands/"):
        raise SystemExit(f"Unsafe or invalid manifest asset path: {value!r}")
    path = (ROOT / "public" / value.removeprefix("/")).resolve()
    output_root = OUTPUT_DIR.resolve()
    if not path.is_relative_to(output_root):
        raise SystemExit(f"Manifest asset escapes the demo directory: {value!r}")
    return path


def verify_manifest(*, probe_when_available: bool = True) -> None:
    manifest_path = OUTPUT_DIR / "manifest.json"
    if not manifest_path.is_file():
        raise SystemExit(f"Missing manifest: {manifest_path}")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SystemExit(f"Invalid manifest: {error}") from error
    assets = manifest.get("assets")
    if not isinstance(assets, list) or len(assets) != len(DEMOS):
        raise SystemExit(f"Manifest must contain exactly {len(DEMOS)} demo assets")

    expected_slugs = {demo.slug for demo in DEMOS}
    actual_slugs = {asset.get("slug") for asset in assets if isinstance(asset, dict)}
    if actual_slugs != expected_slugs:
        raise SystemExit(
            f"Manifest slugs differ: expected {sorted(expected_slugs)}, got {sorted(map(str, actual_slugs))}"
        )
    expected_outcomes = {demo.slug: demo.outcome for demo in DEMOS}
    expected_demos = {demo.slug: demo for demo in DEMOS}

    for asset in assets:
        slug = asset["slug"]
        demo = expected_demos[slug]
        if asset.get("command") != demo.command:
            raise SystemExit(
                f"{slug}: command mismatch ({asset.get('command')!r} != {demo.command!r})"
            )
        if asset.get("expectedExitCode") != demo.expected_exit_code:
            raise SystemExit(f"{slug}: expectedExitCode differs from the capture contract")
        if asset.get("outcome") != expected_outcomes[slug]:
            raise SystemExit(
                f"{slug}: outcome mismatch ({asset.get('outcome')!r} != {expected_outcomes[slug]!r})"
            )
        if asset.get("outcome") == "success" and asset.get("exitCode") != 0:
            raise SystemExit(f"{slug}: success outcome requires exitCode 0")
        records = (
            ("src", "bytes", "sha256"),
            ("poster", "posterBytes", "posterSha256"),
            ("transcript", "transcriptBytes", "transcriptSha256"),
        )
        resolved: dict[str, Path] = {}
        for path_key, bytes_key, digest_key in records:
            path = public_path(asset.get(path_key))
            resolved[path_key] = path
            if not path.is_file():
                raise SystemExit(f"{slug}: missing {path_key} file: {path}")
            expected_bytes = asset.get(bytes_key)
            if path.stat().st_size != expected_bytes:
                raise SystemExit(
                    f"{slug}: {path_key} byte mismatch (manifest={expected_bytes}, actual={path.stat().st_size})"
                )
            expected_digest = asset.get(digest_key)
            actual_digest = sha256(path)
            if actual_digest != expected_digest:
                raise SystemExit(
                    f"{slug}: {path_key} sha256 mismatch (manifest={expected_digest}, actual={actual_digest})"
                )

        if resolved["poster"].read_bytes()[:8] != b"\x89PNG\r\n\x1a\n":
            raise SystemExit(f"{slug}: poster is not a PNG file")
        if b"ftyp" not in resolved["src"].read_bytes()[:32]:
            raise SystemExit(f"{slug}: video is not an ISO base media/MP4 file")
        transcript_first_line = resolved["transcript"].read_text(encoding="utf-8").splitlines()[0]
        if transcript_first_line != f"$ {asset.get('command')}":
            raise SystemExit(f"{slug}: transcript command does not match the manifest")

        if probe_when_available and shutil.which("ffprobe"):
            probe = probe_video(resolved["src"])
            if abs(float(probe["duration"]) - float(asset.get("duration", -1))) > 0.01:
                raise SystemExit(
                    f"{slug}: ffprobe duration differs from manifest "
                    f"({probe['duration']} != {asset.get('duration')})"
                )

    print(
        f"verified {len(assets)} command demos: file presence, byte counts, sha256, "
        f"container signatures, and transcript commands"
        + ("; ffprobe metadata checked" if probe_when_available and shutil.which("ffprobe") else "")
    )


def write_manifest(
    source: Path,
    commit: str,
    remote: str,
    version: str,
    rows: list[dict[str, object]],
) -> None:
    manifest = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "provenance": {
            "repository": remote,
            "commit": commit,
            "version": version,
            "sourceWasClean": True,
            "captureScript": "scripts/capture-command-demos.py",
            "processEvidence": (
                "Each transcript is stdout+stderr captured from the real omm console "
                "script installed editable from this commit. Interactive videos use "
                "VT100 screen checkpoints reconstructed from those real process bytes "
                "and record the exact input events; no command result text is synthesized."
            ),
            "sourcePathPolicy": (
                "The source clone, virtualenv, HOME, OMM_HOME, XDG cache, uv cache, and "
                "TMPDIR were disposable paths removed after capture. Absolute temporary "
                "paths are intentionally omitted from public artifacts."
            ),
        },
        "safety": {
            "liveOmmRunRequests": 0,
            "liveWorkersDevRequests": 0,
            "cliNetworkPolicy": (
                "External HTTP(S) and ALL_PROXY forced to unused 127.0.0.1:9. The "
                "contribute demo alone allows a temporary GET-only loopback fixture "
                "on 127.0.0.1:11434 and fails on any POST."
            ),
            "telemetryPolicy": (
                "never by default; contribute uses ask only until the captured 'n' "
                "response cancels before compute or upload"
            ),
            "userHomeTouched": False,
            "modelDownloadsStarted": False,
            "modelExecutionsStarted": False,
            "engineInstallationsStarted": False,
            "benchmarksStarted": False,
            "telemetryUploadsStarted": False,
        },
        "assets": rows,
    }
    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Verify checked-in assets from manifest.json without network, uv, or ImageMagick.",
    )
    parser.add_argument(
        "--no-ffprobe",
        action="store_true",
        help="Skip optional ffprobe metadata checks during --verify-only.",
    )
    parser.add_argument(
        "--only",
        nargs="+",
        choices=[demo.slug for demo in DEMOS],
        help="Recapture only these slugs and preserve the other manifest rows/assets.",
    )
    args = parser.parse_args()
    if args.verify_only:
        verify_manifest(probe_when_available=not args.no_ffprobe)
        return

    require_tools()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="omm-command-demos-") as temporary:
        workspace = Path(temporary)
        source, commit, remote = source_checkout(workspace)
        version = project_version(source)
        _, omm_home, env = prepare_runtime(workspace, source, commit)
        frame_root = workspace / "frames"
        selected = set(args.only or [demo.slug for demo in DEMOS])
        existing_rows: dict[str, dict[str, object]] = {}
        if args.only:
            manifest_path = OUTPUT_DIR / "manifest.json"
            if not manifest_path.is_file():
                raise SystemExit("--only requires an existing manifest.json")
            existing_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            existing_rows = {
                row["slug"]: row for row in existing_manifest.get("assets", [])
            }
        rows: list[dict[str, object]] = []

        for demo in DEMOS:
            if demo.slug not in selected:
                if demo.slug not in existing_rows:
                    raise SystemExit(f"Existing manifest is missing preserved slug {demo.slug}")
                preserved = dict(existing_rows[demo.slug])
                preserved["outcome"] = demo.outcome
                rows.append(preserved)
                continue
            exit_code, transcript, snapshots, input_events, fixture_record = capture_demo(
                demo, env, workspace, omm_home
            )
            video, poster, transcript_path = render_asset(
                demo, transcript, frame_root, snapshots
            )
            probe = probe_video(video)
            video_meta = file_record(video)
            poster_meta = file_record(poster)
            transcript_meta = file_record(transcript_path)
            if video_meta["bytes"] > 2_000_000:
                raise SystemExit(f"{video.name}: exceeds the 2 MB web asset budget")
            rows.append(
                {
                    "slug": demo.slug,
                    "src": f"/demos/commands/{video.name}",
                    "poster": f"/demos/commands/{poster.name}",
                    "transcript": f"/demos/commands/{transcript_path.name}",
                    **probe,
                    **video_meta,
                    "posterBytes": poster_meta["bytes"],
                    "posterSha256": poster_meta["sha256"],
                    "transcriptBytes": transcript_meta["bytes"],
                    "transcriptSha256": transcript_meta["sha256"],
                    "command": demo.command,
                    "argv": ["omm", *demo.argv],
                    "exitCode": exit_code,
                    "expectedExitCode": demo.expected_exit_code,
                    "outcome": demo.outcome,
                    "captureMode": "pseudo-tty" if demo.input_steps else "closed-stdin",
                    "inputEvents": input_events,
                    "fixture": fixture_record,
                    "safetyPath": demo.safety_path,
                }
            )
            print(
                f"captured {demo.slug}: exit={exit_code}, {probe['duration']}s, "
                f"{video_meta['bytes']} bytes, sha256={str(video_meta['sha256'])[:12]}…"
            )

        write_manifest(source, commit, remote, version, rows)
        print(f"wrote {OUTPUT_DIR / 'manifest.json'} from omm {version} @ {commit}")


if __name__ == "__main__":
    main()
