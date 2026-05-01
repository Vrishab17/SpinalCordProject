"use client";

import { useState } from "react";
import BioDigitalDermatomeViewer from "./BioDigitalDermatomeViewer";
import type { DermatomeScores } from "./useBioDigitalHighlight";

export default function AssessmentForm() {
    // The ISNCSCI input grid is not yet implemented (tracked separately).
    // For now, hold dermatome scores in component state so the viewer can be
    // exercised; future work will replace this with the real form fields.
    const [dermatomeScores] = useState<DermatomeScores>({});

    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded border border-gray-200 p-4">
                <h2 className="text-lg font-medium">Sensory & Motor Inputs</h2>
                <p className="mt-2 text-sm text-gray-600">
                    ISNCSCI grid coming soon. Selections made here will color the
                    dermatomes on the model on the right.
                </p>
            </div>

            {/*
              One-time setup: flip `debugLogPicks` to true, run `npm run dev`,
              click each dermatome on the model, and paste the logged objectIds
              into src/lib/biodigital/dermatomeMap.ts. Flip back to false when done.
            */}
            <BioDigitalDermatomeViewer
                scores={dermatomeScores}
                debugLogPicks={false}
            />
        </div>
    );
}
