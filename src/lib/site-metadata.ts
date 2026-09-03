export const PYPI_RELEASE_URL = "https://pypi.org/pypi/omm-model/json";

/** Only label versions actually returned for the published OMM package. */
export function publishedVersion(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("info" in value)) return null;
  const info = value.info;
  if (typeof info !== "object" || info === null || !("name" in info) || !("version" in info)) {
    return null;
  }
  return info.name === "omm-model" && typeof info.version === "string" &&
    info.version.length <= 64 && /^\d+\.\d+\.\d+$/u.test(info.version)
    ? `v${info.version}`
    : null;
}

/** Resolve once while building; runtime Workers never need to execute git. */
export function buildCommitSha(
  env: Readonly<Record<string, string | undefined>>,
  readLocalCommit: () => string,
): string {
  const isCommit = (value: string | undefined): value is string =>
    value !== undefined && /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/iu.test(value);
  for (const value of [
    env.WORKERS_CI_COMMIT_SHA,
    env.CF_PAGES_COMMIT_SHA,
    env.GITHUB_SHA,
    env.VERCEL_GIT_COMMIT_SHA,
  ]) {
    if (isCommit(value)) return value.toLowerCase();
  }
  try {
    const local = readLocalCommit().trim();
    return isCommit(local) ? local.toLowerCase() : "";
  } catch {
    return "";
  }
}
