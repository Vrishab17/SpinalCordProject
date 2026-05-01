"use client";

import { useEffect, useRef } from "react";
import type { BioDigitalColor, BioDigitalHuman } from "@/types/biodigital";
import {
  DERMATOME_LEVELS,
  type DermatomeKey,
  type DermatomeLevel,
  type DermatomeSide,
  dermatomeKey,
  getDermatomeObjectId,
  isPlaceholderObjectId,
} from "@/lib/biodigital/dermatomeMap";

export type DermatomeScore = 0 | 1 | 2 | "NT";

export type DermatomeScores = Partial<Record<DermatomeKey, DermatomeScore>>;

type HighlightStyle = { color: BioDigitalColor; opacity?: number };

// Color values are in 0..1 RGB as expected by the BioDigital Human API.
// 2 (normal) -> green, 1 (impaired) -> yellow, 0 (absent) -> red, "NT" -> gray.
const SCORE_STYLES: Record<DermatomeScore, HighlightStyle> = {
  2: { color: { diffuse: { r: 0.2, g: 0.8, b: 0.3 } }, opacity: 0.85 },
  1: { color: { diffuse: { r: 0.95, g: 0.85, b: 0.2 } }, opacity: 0.85 },
  0: { color: { diffuse: { r: 0.85, g: 0.2, b: 0.2 } }, opacity: 0.85 },
  NT: { color: { diffuse: { r: 0.55, g: 0.55, b: 0.55 } }, opacity: 0.5 },
};

function buildAllKeys(): DermatomeKey[] {
  const keys: DermatomeKey[] = [];
  for (const level of DERMATOME_LEVELS) {
    keys.push(dermatomeKey(level, "L"));
    keys.push(dermatomeKey(level, "R"));
  }
  return keys;
}

const ALL_KEYS = buildAllKeys();

function parseKey(key: DermatomeKey): {
  level: DermatomeLevel;
  side: DermatomeSide;
} {
  const idx = key.lastIndexOf("_");
  return {
    level: key.slice(0, idx) as DermatomeLevel,
    side: key.slice(idx + 1) as DermatomeSide,
  };
}

// Drives the loaded BioDigital model so its dermatomes reflect the current
// `scores` prop. Only runs after `ready` flips true (i.e. after `human.ready`).
//
// Diff-based: when a score changes the corresponding objectId is recolored;
// when a score is cleared the objectId is reset. Placeholder object IDs from
// the unconfigured dermatome map are skipped silently so the dev experience
// stays clean until the discovery step has been done.
export function useBioDigitalHighlight(
  human: BioDigitalHuman | null,
  ready: boolean,
  scores: DermatomeScores
) {
  const previousRef = useRef<DermatomeScores>({});

  useEffect(() => {
    if (!human || !ready) return;

    const previous = previousRef.current;
    const toReset: string[] = [];

    for (const key of ALL_KEYS) {
      const prev = previous[key];
      const next = scores[key];
      if (prev === next) continue;

      const { level, side } = parseKey(key);
      const objectId = getDermatomeObjectId(level, side);
      if (isPlaceholderObjectId(objectId)) continue;

      if (next === undefined) {
        toReset.push(objectId);
        continue;
      }

      const style = SCORE_STYLES[next];
      human.send("scene.colorObject", {
        objectId,
        color: style.color,
        opacity: style.opacity,
      });
    }

    if (toReset.length > 0) {
      human.send("scene.colorObject.reset", { objectIds: toReset });
    }

    previousRef.current = { ...scores };
  }, [human, ready, scores]);
}
