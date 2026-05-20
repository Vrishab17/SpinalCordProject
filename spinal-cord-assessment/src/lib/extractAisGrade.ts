/**
 * Reads AIS letter from an ISNCSCI calculation result for storage in `als_grade`.
 */
export function extractAisGradeFromResult(result: unknown): string | null {
  const r = result as { classification?: Record<string, unknown> } | undefined;
  const c = r?.classification;
  if (!c || typeof c !== "object") return null;

  const raw =
    c.ASIAImpairmentScale ??
    c.asiaImpairmentScale ??
    (c as Record<string, unknown>)["ASIA Impairment Scale"];

  if (raw == null || raw === "") return null;
  const s = String(raw).trim();

  const word = s.match(/\b([A-E])\b/i);
  if (word) return word[1].toUpperCase();
  if (/^[A-E]$/i.test(s)) return s.toUpperCase();

  return s.length > 0 ? s.slice(0, 16) : null;
}
