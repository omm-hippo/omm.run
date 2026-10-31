# Model selection checklist

- [ ] Identify the exact checkpoint and revision, not only its family.
- [ ] Confirm the needed text, image, video or audio input.
- [ ] Check total weight size and the actual quantized file size.
- [ ] Do not substitute active MoE parameters for the full weight footprint.
- [ ] Distinguish native context from configuration-dependent extensions.
- [ ] Check architecture, chat template and vision/audio adapters in the runner.
- [ ] Read the license, terms and original repository.
- [ ] Check current memory fit with `omm fit`.
- [ ] Check generation with `omm verify`, then evaluate your actual task examples.

Raw weight calculations are not measured RAM/VRAM. Installation, linking, generation and task quality require separate checks.

Model finder: https://omm.run/en/models
