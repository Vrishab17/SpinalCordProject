"use client";

import Script from "next/script";
import { useId, useRef, useState } from "react";
import type { BioDigitalHuman } from "@/types/biodigital";
import {
  useBioDigitalHighlight,
  type DermatomeScores,
} from "./useBioDigitalHighlight";

const HUMAN_API_SRC =
  "https://human-api.biodigital.com/build/1.2.1/human-api-1.2.1.min.js";

const WIDGET_BASE = "https://human.biodigital.com/widget/";

// Strip a few of the chrome elements so the viewer feels embedded rather
// than like a full BioDigital experience. See:
// https://developer.biodigital.com/pages/documentation/1/customizing/url-parameters.html
const WIDGET_QUERY_DEFAULTS: Record<string, string> = {
  "ui-anatomy-labels": "false",
  "ui-anatomy-descriptions": "false",
  "ui-tools": "false",
  "ui-fullscreen": "false",
  "ui-info": "false",
  "ui-share": "false",
  "ui-help": "false",
  "ui-zoom": "true",
  "ui-nav": "true",
  load_rotate: "0",
  uaid: "1",
};

export type BioDigitalDermatomeViewerProps = {
  scores: DermatomeScores;
  className?: string;
  // Set true while wiring the dermatomeMap to log every clicked objectId
  // to the console. Leave false in production.
  debugLogPicks?: boolean;
};

function buildSrc(modelId: string, devKey: string): string {
  const params = new URLSearchParams({
    m: modelId,
    dk: devKey,
    ...WIDGET_QUERY_DEFAULTS,
  });
  return `${WIDGET_BASE}?${params.toString()}`;
}

export default function BioDigitalDermatomeViewer({
  scores,
  className,
  debugLogPicks = false,
}: BioDigitalDermatomeViewerProps) {
  const reactId = useId();
  const iframeId = `biodigital-dermatome-${reactId.replace(/:/g, "")}`;

  const [human, setHuman] = useState<BioDigitalHuman | null>(null);
  const [ready, setReady] = useState(false);
  const initializedRef = useRef(false);

  const dk = process.env.NEXT_PUBLIC_BIODIGITAL_DEVELOPER_KEY;
  const modelId = process.env.NEXT_PUBLIC_BIODIGITAL_DERMATOME_MODEL_ID;

  useBioDigitalHighlight(human, ready, scores);

  if (!dk || !modelId) {
    return (
      <div
        className={
          "flex h-[600px] w-full items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600 " +
          (className ?? "")
        }
      >
        <div>
          <p className="font-medium">BioDigital model not configured.</p>
          <p className="mt-1">
            Set{" "}
            <code className="rounded bg-gray-200 px-1">
              NEXT_PUBLIC_BIODIGITAL_DEVELOPER_KEY
            </code>{" "}
            and{" "}
            <code className="rounded bg-gray-200 px-1">
              NEXT_PUBLIC_BIODIGITAL_DERMATOME_MODEL_ID
            </code>{" "}
            in <code className="rounded bg-gray-200 px-1">.env.local</code> and
            restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const initHumanApi = () => {
    if (initializedRef.current) return;
    if (typeof window === "undefined" || !window.HumanAPI) return;

    initializedRef.current = true;
    const instance = new window.HumanAPI.Human(iframeId);

    instance.on("human.ready", () => {
      setReady(true);
    });

    if (debugLogPicks) {
      instance.on("scene.picked", (event) => {
        // Used during the dermatomeMap discovery step.
        // eslint-disable-next-line no-console
        console.log("[BioDigital pick]", event);
      });
    }

    setHuman(instance);
  };

  return (
    <div className={"relative h-[600px] w-full " + (className ?? "")}>
      <Script
        src={HUMAN_API_SRC}
        strategy="afterInteractive"
        onReady={initHumanApi}
        onLoad={initHumanApi}
      />
      <iframe
        id={iframeId}
        title="BioDigital Human dermatome viewer"
        src={buildSrc(modelId, dk)}
        className="h-full w-full rounded border border-gray-200"
        allow="fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-white/60 text-sm text-gray-600">
          Loading dermatome model...
        </div>
      )}
    </div>
  );
}
