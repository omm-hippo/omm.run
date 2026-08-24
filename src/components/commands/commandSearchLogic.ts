export const COMMAND_SEARCH_FIELDS = [
  "name",
  "summary",
  "use",
  "options",
  "errors",
] as const;

export type CommandSearchField = (typeof COMMAND_SEARCH_FIELDS)[number];

export type CommandSearchIndexItem = {
  readonly slug: string;
  readonly name: string;
  readonly href: string;
  readonly summary: string;
  readonly fields: Readonly<Record<CommandSearchField, readonly string[]>>;
};

export type CommandSearchResult = CommandSearchIndexItem & {
  readonly matchedFields: readonly CommandSearchField[];
};

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().trim();
}

function tokensFor(query: string): readonly string[] {
  return [...new Set(normalize(query).split(/\s+/).filter(Boolean))];
}

/**
 * Searches with AND semantics: every word must occur somewhere in a command,
 * while the words can come from different fields (for example `json install`).
 * Name matches rank first, then summary, options, uses and error guidance.
 */
export function searchCommandIndex(
  index: readonly CommandSearchIndexItem[],
  query: string,
): readonly CommandSearchResult[] {
  const tokens = tokensFor(query);

  if (tokens.length === 0) {
    return index.map((item) => ({ ...item, matchedFields: [] }));
  }

  const normalizedQuery = normalize(query);

  return index
    .map((item, originalIndex) => {
      const normalizedName = normalize(item.name);
      const fields = Object.fromEntries(
        COMMAND_SEARCH_FIELDS.map((field) => [
          field,
          normalize(item.fields[field].join(" ")),
        ]),
      ) as Record<CommandSearchField, string>;
      const matchedFields = new Set<CommandSearchField>();
      let score = 0;

      for (const token of tokens) {
        const tokenMatches = COMMAND_SEARCH_FIELDS.filter((field) =>
          fields[field].includes(token),
        );

        if (tokenMatches.length === 0) return null;

        for (const field of tokenMatches) matchedFields.add(field);
        if (tokenMatches.includes("name")) score += 60;
        if (tokenMatches.includes("summary")) score += 24;
        if (tokenMatches.includes("options")) score += 18;
        if (tokenMatches.includes("use")) score += 14;
        if (tokenMatches.includes("errors")) score += 10;
      }

      if (normalizedName === normalizedQuery) score += 200;
      else if (normalizedName.startsWith(normalizedQuery)) score += 100;

      return {
        originalIndex,
        score,
        result: {
          ...item,
          matchedFields: COMMAND_SEARCH_FIELDS.filter((field) =>
            matchedFields.has(field),
          ),
        },
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .map((entry) => entry.result);
}
