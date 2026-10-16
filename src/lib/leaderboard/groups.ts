import type { Locale } from "@/i18n/config";

/** Mirrors omm's `memory_group.BUCKET_LABELS`. A key outside it (a bucket
 *  table this page predates) is shown as its raw key, never dropped. */
const BUCKETS: Record<string, readonly string[]> = {
  unified: ["8", "16", "18-24", "32-36", "48-64", "96-128", "192+"],
  vram: ["0-6", "8", "10-12", "16", "20-24", "32+"],
  cpu: ["0-8", "16", "32", "64+"],
};

const FAMILY: Record<Locale, Record<string, string>> = {
  ko: { unified: "Mac · 통합 메모리", vram: "PC · GPU VRAM", cpu: "CPU 전용 · RAM" },
  en: { unified: "Mac · unified memory", vram: "PC · GPU VRAM", cpu: "CPU only · RAM" },
};

const OVERALL: Record<Locale, string> = { ko: "전체", en: "All machines" };

export type GroupFamily = "unified" | "vram" | "cpu" | "unknown";

function split(key: string): [string, string] {
  const index = key.indexOf(":");
  return index < 0 ? [key, ""] : [key.slice(0, index), key.slice(index + 1)];
}

export function groupFamily(key: string): GroupFamily {
  const [kind, bucket] = split(key);
  return BUCKETS[kind]?.includes(bucket) ? (kind as GroupFamily) : "unknown";
}

export function bucketSize(bucket: string): string {
  if (bucket.startsWith("0-")) return `≤${bucket.slice(2)}GB`;
  if (bucket.endsWith("+")) return `${bucket.slice(0, -1)}GB+`;
  return `${bucket.replace("-", "–")}GB`;
}

export function groupLabel(key: string, locale: Locale): string {
  if (key === "overall") return OVERALL[locale];
  const family = groupFamily(key);
  if (family === "unknown") return key;
  return `${FAMILY[locale][family]} ${bucketSize(split(key)[1])}`;
}

/** Nav order: overall first, then unified, vram, cpu, unknown; buckets in
 *  table order inside a family. */
export function groupOrder(key: string): [number, number, string] {
  const family = groupFamily(key);
  const familyIndex = ["unified", "vram", "cpu", "unknown"].indexOf(family);
  const bucketIndex = family === "unknown" ? 0 : BUCKETS[family].indexOf(split(key)[1]);
  return [familyIndex, bucketIndex, key];
}
