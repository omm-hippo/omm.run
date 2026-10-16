"""Synthetic arena votes for site fixtures. Numbers are not real."""
import json, random, sys
rng = random.Random(410)
models = {  # name: (repo, true strength, tok/s per GiB)
    "Qwen2.5-7B-Instruct-Q4_K_M.gguf": ("Qwen/Qwen2.5-7B-Instruct-GGUF", 1.2, 9.0),
    "Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf": ("bartowski/Meta-Llama-3.1-8B-Instruct-GGUF", 1.0, 7.0),
    "gemma-2-9b-it-Q5_K_M.gguf": ("bartowski/gemma-2-9b-it-GGUF", 0.4, 5.0),
    "Mistral-Nemo-Instruct-2407-Q4_K_M.gguf": ("bartowski/Mistral-Nemo-Instruct-2407-GGUF", 0.2, 4.5),
    "Phi-3.5-mini-instruct-Q4_K_M.gguf": ("bartowski/Phi-3.5-mini-instruct-GGUF", -0.5, 14.0),
    "Llama-3.2-3B-Instruct-Q4_K_M.gguf": ("bartowski/Llama-3.2-3B-Instruct-GGUF", -0.8, 16.0),
    "local-merge-Q4_K_M.gguf": (None, 0.0, 6.0),
    "tinyllama-1.1b-chat-Q4_K_M.gguf": ("TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF", -1.5, 20.0),
}
names = list(models)
groups = [("unified", "16")] * 5 + [("vram", "8")] * 3 + [None] * 2
count = int(sys.argv[1])
rows = []
for i in range(count):
    a, b = rng.sample(names[:6] if i % 9 else names[:7], 2)
    if i % 97 == 5:
        a = names[7]
    sa, sb = models[a][1], models[b][1]
    p = 1 / (1 + 2.718 ** (sb - sa))
    winner = "both_bad" if rng.random() < 0.06 else ("a" if rng.random() < p else "b")
    grp = ("cpu", "32") if i % 30 == 7 else groups[i % len(groups)]
    machine = 1.0 + (i % 7) * 0.5
    row = {"schema_version": 1, "battle_id": f"{i:08x}-0000-4000-8000-{i:012x}",
           "client_id": f"{(i * 7919) % 97:08x}", "recorded_at": f"2026-10-{1 + i % 15:02d}T10:00:00+00:00",
           "engine": "ollama", "winner": winner,
           "model_filename_a": a, "model_filename_b": b, "elapsed_a": 4.0, "elapsed_b": 5.0,
           "tokens_a": 200, "tokens_b": 220,
           "tokens_per_second_a": models[a][2] * 4 * machine, "memory_gb_a": 4.0,
           "tokens_per_second_b": models[b][2] * 4 * machine, "memory_gb_b": 4.0}
    for side, n in (("a", a), ("b", b)):
        if models[n][0]:
            row[f"model_repo_id_{side}"] = models[n][0]
            row[f"model_provider_{side}"] = "huggingface"
    if grp:
        row["memory_kind"], row["memory_bucket"] = grp
    rows.append(row)
print("\n".join(json.dumps(r) for r in rows))
