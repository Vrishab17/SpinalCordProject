"use client";

import { useEffect, useMemo, useState } from "react";

export type DraftStatus = "OPEN" | "DRAFT" | "FINALIZED";

export type DraftAssessment = {
  id: string;
  nhi: string;
  patientName: string;
  dateLastEditedISO: string; // ISO string for stable sorting + formatting
  versionNumber: number; // Display as v{n}
  status: DraftStatus;
};

const STORAGE_KEY = "spinal_cord_assessment_drafts_v1";

const seedDrafts: DraftAssessment[] = [
  {
    id: "draft-aca3f1",
    nhi: "ACA31FM",
    patientName: "Sarah Collins",
    dateLastEditedISO: "2026-03-12T09:10:00.000Z",
    versionNumber: 1,
    status: "OPEN",
  },
  {
    id: "draft-bj06a5",
    nhi: "BJ06A5",
    patientName: "Noah Mitchell",
    dateLastEditedISO: "2026-02-22T14:40:00.000Z",
    versionNumber: 1,
    status: "OPEN",
  },
  {
    id: "draft-cyq36ab",
    nhi: "CQY36AB",
    patientName: "Daniel Walker",
    dateLastEditedISO: "2026-02-21T08:20:00.000Z",
    versionNumber: 3,
    status: "OPEN",
  },
  {
    id: "draft-bhd21se",
    nhi: "BHD21SE",
    patientName: "Michael Turner",
    dateLastEditedISO: "2026-01-27T11:05:00.000Z",
    versionNumber: 2,
    status: "OPEN",
  },
  {
    id: "draft-kcq9z9g",
    nhi: "KAQ92YG",
    patientName: "Lauren Hayes",
    dateLastEditedISO: "2026-02-19T13:15:00.000Z",
    versionNumber: 1,
    status: "FINALIZED",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  // Using en-NZ to match dd/mm/yyyy expectation.
  return new Intl.DateTimeFormat("en-NZ").format(d);
}

export default function Drafts() {
  const [drafts, setDrafts] = useState<DraftAssessment[]>(() => seedDrafts);
  const [openDraftId, setOpenDraftId] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted list (client-side only).
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DraftAssessment[];
      if (!Array.isArray(parsed)) return;
      setDrafts(parsed);
    } catch {
      // If localStorage is corrupted, fall back to seed data.
      setDrafts(seedDrafts);
    }
  }, []);

  useEffect(() => {
    // Persist list so drafts survive refresh.
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      // Ignore quota/denied errors.
    }
  }, [drafts]);

  const sortedDrafts = useMemo(() => {
    return [...drafts].sort((a, b) => {
      return new Date(b.dateLastEditedISO).getTime() - new Date(a.dateLastEditedISO).getTime();
    });
  }, [drafts]);

  function labelStatus(s: DraftStatus) {
    // The screenshot’s column reads "Open" for pending work.
    if (s === "OPEN") return "Open";
    if (s === "FINALIZED") return "Finalized";
    return "Draft";
  }

  return (
    <div className="rounded border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Pending Drafts</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2 pr-2 font-medium">NHI</th>
              <th className="py-2 pr-2 font-medium">Patient Name</th>
              <th className="py-2 pr-2 font-medium">Date</th>
              <th className="py-2 pr-2 font-medium">Version</th>
              <th className="py-2 pr-2 font-medium">Status</th>
              <th className="py-2 pl-2 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {sortedDrafts.map((d) => (
              <tr key={d.id} className="border-b border-gray-200">
                <td className="py-2 pr-2">{d.nhi}</td>
                <td className="py-2 pr-2">{d.patientName}</td>
                <td className="py-2 pr-2">{formatDate(d.dateLastEditedISO)}</td>
                <td className="py-2 pr-2">v{d.versionNumber}</td>
                <td className="py-2 pr-2">{labelStatus(d.status)}</td>
                <td className="py-2 pl-2">
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={() => setOpenDraftId(d.id)}
                    aria-label={`Open draft ${d.nhi}`}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
            {sortedDrafts.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={6}>
                  No drafts yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {openDraftId ? (
        <div className="mt-4 rounded border bg-gray-50 p-3 text-sm">
          {(() => {
            const selected = drafts.find((x) => x.id === openDraftId);
            if (!selected) return null;
            return (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">
                    Selected draft: {selected.patientName} ({selected.nhi})
                  </div>
                  <div className="mt-1 text-gray-700">
                    Version v{selected.versionNumber} • Last edited {formatDate(selected.dateLastEditedISO)}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded border px-3 py-1 text-xs hover:bg-white"
                  onClick={() => setOpenDraftId(null)}
                >
                  Close
                </button>
              </div>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
}

