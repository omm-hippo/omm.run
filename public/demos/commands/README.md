# OMM command demo media

These short, silent videos are rendered from transcripts captured from the
real `omm` console process. They are not mock terminal output. Exact commands,
exit codes, source commit, hashes, durations, and the safety path for each demo
are recorded in `manifest.json`.

Regenerate from a fresh temporary clone of `omm-hippo/omm`:

```sh
python3 scripts/capture-command-demos.py
```

To reproduce from a specific clean checkout (for example, the commit recorded
in the manifest):

```sh
OMM_DEMO_SOURCE=/absolute/path/to/clean/omm \
  python3 scripts/capture-command-demos.py
```

CI can verify file presence, byte counts, SHA-256 hashes, container signatures,
and transcript commands using only Python's standard library:

```sh
python3 scripts/capture-command-demos.py --verify-only --no-ffprobe
```

Without `--no-ffprobe`, the verifier also checks duration, codec, dimensions,
pixel format, and absence of audio when `ffprobe` is available.

The capture script uses a disposable virtual environment, `HOME`, `OMM_HOME`,
XDG cache, uv cache, and temporary directory. The CLI's HTTP(S) proxy is set to
an unused loopback port, telemetry and error reports are disabled, and the
commands are deliberately limited to read-only output or early local guards.
It does not start model or engine downloads, model execution, engine installs,
benchmarks, or telemetry uploads. It never requests `omm.run` or an OMM
`workers.dev` endpoint.
