/** Decimal GB for raw weights alone; runtime memory and file metadata are excluded. */
export function rawWeightIllustration(parametersB: number, bits: 4 | 8 | 16): number {
  return parametersB * bits / 8;
}
