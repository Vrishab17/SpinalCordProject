/** Normalise NHI: trim, remove spaces, uppercase. */
export function normalizeNhi(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toUpperCase();
}

/** NZ NHI pattern: 3 letters + 4 alphanumeric. */
export function isValidNhiFormat(normalized: string): boolean {
  return /^[A-Z]{3}[0-9A-Z]{4}$/.test(normalized);
}

export function validateNhiInput(raw: string): { ok: true; nhi: string } | { ok: false; message: string } {
  const nhi = normalizeNhi(raw);
  if (!nhi) {
    return { ok: false, message: "Enter an NHI number." };
  }
  if (!isValidNhiFormat(nhi)) {
    return {
      ok: false,
      message:
        "That NHI doesn't look valid. Use 7 characters: 3 letters followed by 4 letters or digits (e.g. ABC1234).",
    };
  }
  return { ok: true, nhi };
}
