// Mapping from ISNCSCI dermatome level + body side to the BioDigital object IDs
// inside the "Dermatomes - Male" model.
//
// IMPORTANT: the `objectId` values below are PLACEHOLDERS. They must be replaced
// with the real IDs reported by `scene.picked` events from the loaded model.
// See the discovery workflow described in the integration plan: temporarily attach
// a console.log handler to `scene.picked`, click each dermatome in the running app,
// and copy the reported `objectId` into the corresponding entry below.

export type DermatomeSide = "L" | "R";

// All sensory-key dermatome levels assessed in ISNCSCI, plus the C1 level which
// is conventionally not tested but is included for completeness so that the
// model can render a neutral state for it.
export const DERMATOME_LEVELS = [
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
  "S2",
  "S3",
  "S4_5",
] as const;

export type DermatomeLevel = (typeof DERMATOME_LEVELS)[number];

export type DermatomeKey = `${DermatomeLevel}_${DermatomeSide}`;

export function dermatomeKey(
  level: DermatomeLevel,
  side: DermatomeSide
): DermatomeKey {
  return `${level}_${side}` as DermatomeKey;
}

// Placeholder object IDs - replace once the real IDs have been discovered.
// Format: `placeholder:<level>:<side>`. The viewer skips entries whose value
// still starts with `placeholder:` so dev runs don't spam console errors.
function placeholder(level: DermatomeLevel, side: DermatomeSide): string {
  return `placeholder:${level}:${side}`;
}

export const DERMATOME_OBJECT_IDS: Record<DermatomeKey, string> =
  DERMATOME_LEVELS.reduce(
    (acc, level) => {
      acc[dermatomeKey(level, "L")] = placeholder(level, "L");
      acc[dermatomeKey(level, "R")] = placeholder(level, "R");
      return acc;
    },
    {} as Record<DermatomeKey, string>
  );

export function isPlaceholderObjectId(objectId: string): boolean {
  return objectId.startsWith("placeholder:");
}

export function getDermatomeObjectId(
  level: DermatomeLevel,
  side: DermatomeSide
): string {
  return DERMATOME_OBJECT_IDS[dermatomeKey(level, side)];
}
