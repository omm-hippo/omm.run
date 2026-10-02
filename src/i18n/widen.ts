/**
 * Turns an `as const` dictionary into its shape: string literals become
 * `string`, tuples stay tuples of the same length, everything else is mapped
 * through unchanged.
 *
 * `en.ts` is the source of truth for the shape; `ko.ts` is declared
 * `satisfies Dictionary`, so a missing key, an extra key, a list of the wrong
 * length, or a rich-text segment that dropped its `code` part is a type error
 * rather than a silent English string in the Korean build.
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
