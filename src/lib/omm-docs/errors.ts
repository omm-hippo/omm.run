/**
 * Thrown by the omm-docs layer when the README can't be turned into a page.
 * Both are caught in `DocBody` and rendered as a fallback panel rather than a
 * 500 — a docs mirror that is briefly unreachable should degrade, not break.
 */

export class OmmDocsUnavailable extends Error {
  readonly status?: number;

  constructor(status?: number) {
    super(
      status === undefined
        ? "omm README could not be fetched"
        : `omm README fetch returned HTTP ${status}`,
    );
    this.name = "OmmDocsUnavailable";
    this.status = status;
  }
}

export class OmmDocsSectionMissing extends Error {
  readonly heading: string;

  constructor(heading: string) {
    super(`omm README has no "${heading}" section`);
    this.name = "OmmDocsSectionMissing";
    this.heading = heading;
  }
}
