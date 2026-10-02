/**
 * Widen readonly Korean dictionary literals into reusable text types while
 * keeping object keys and tuple positions intact.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends object
        ? { readonly [K in keyof T]: Widen<T[K]> }
        : T;
