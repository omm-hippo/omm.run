/**
 * Ed25519 verification of omm's signed arena leaderboard.
 *
 * Same manifest contract as omm's `catalog.verify_signed_artifact`:
 * `{schema_version: 1, artifact_sha256, signature}`, the signature over the
 * exact artifact bytes. Runs server-side (WebCrypto in the Worker), so the page
 * never renders data that did not verify.
 */

/** omm's `config.py` `DEFAULT_CONFIG["catalog_public_key"]`. Kept in sync by
 *  `npm run check:omm-sync`, so a key rotation cannot silently break the page. */
export const ARENA_PUBLIC_KEY = "p8uo6GFXDcg8Rp7/t8GGl5hwPsXhObY5vI1sll5KpaI=";

function decodeBase64(value: unknown): Uint8Array<ArrayBuffer> | null {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/u.test(value)) return null;
  try {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function sha256Hex(raw: Uint8Array<ArrayBuffer>): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", raw));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifySignedArtifact(
  raw: Uint8Array,
  manifest: unknown,
  publicKeyB64: string,
): Promise<boolean> {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return false;
  const fields = manifest as Record<string, unknown>;
  if (fields.schema_version !== 1) return false;
  const bytes = new Uint8Array(raw);
  if (fields.artifact_sha256 !== (await sha256Hex(bytes))) return false;
  const key = decodeBase64(publicKeyB64);
  const signature = decodeBase64(fields.signature);
  if (!key || key.byteLength !== 32 || !signature || signature.byteLength !== 64) return false;
  try {
    const imported = await crypto.subtle.importKey("raw", key, { name: "Ed25519" }, false, ["verify"]);
    return await crypto.subtle.verify({ name: "Ed25519" }, imported, signature, bytes);
  } catch {
    return false;
  }
}
