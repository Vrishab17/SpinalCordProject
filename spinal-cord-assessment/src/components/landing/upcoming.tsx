"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  DEFAULT_CLINICIAN_PATIENT_FILTER,
  type ClinicianPatientFilter,
} from "@/lib/clinicianPatientFilter";
import TablePagination from "@/components/landing/TablePagination";

const PAGE_SIZE = 12;

type UpcomingReviewsProps = {
  clinicianPatientFilter?: ClinicianPatientFilter;
};

type AssessmentRow = {
  assessment_id: string;
  PATIENTpatient_id: number;
  review_date: string;
};

type PatientRow = {
  patient_id: number;
  nhi_number: string;
};

type PatientNameRow = {
  PATIENTpatient_id: number;
  given_name: string;
  family_name: string;
};

type UpcomingReviewDisplay = {
  id: string;
  patientId: number;
  nhi: string;
  patientName: string;
  date: string;
  isToday: boolean;
  isOverdue: boolean;
  reviewDateMs: number;
  reviewDateRaw: string;
};

type ReviewModalStep = "actions" | "change-date";

function parseReviewCalendarDate(dateString: string): Date {
  const dateOnly = dateString.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(dateString);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function formatReviewDate(dateString: string) {
  const reviewOnly = parseReviewCalendarDate(dateString);
  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const reviewDateMs = reviewOnly.getTime();
  const isToday = reviewDateMs === todayOnly.getTime();
  const isOverdue = reviewDateMs < todayOnly.getTime();

  if (isToday) {
    return { formatted: "Today", isToday: true, isOverdue: false, reviewDateMs };
  }

  const day = String(reviewOnly.getDate()).padStart(2, "0");
  const month = String(reviewOnly.getMonth() + 1).padStart(2, "0");
  const year = reviewOnly.getFullYear();

  return {
    formatted: `${day}/${month}/${year}`,
    isToday: false,
    isOverdue,
    reviewDateMs,
  };
}

/** One upcoming row per patient ??? earliest review date wins. */
function dedupeAssessmentsByPatient(
  assessments: AssessmentRow[]
): AssessmentRow[] {
  const byPatient = new Map<number, AssessmentRow>();
  for (const row of assessments) {
    const existing = byPatient.get(row.PATIENTpatient_id);
    if (!existing || row.review_date < existing.review_date) {
      byPatient.set(row.PATIENTpatient_id, row);
    }
  }
  return Array.from(byPatient.values());
}

export default function UpcomingReviews({
  clinicianPatientFilter = DEFAULT_CLINICIAN_PATIENT_FILTER,
}: UpcomingReviewsProps) {
  const [rows, setRows] = useState<UpcomingReviewDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bellHover, setBellHover] = useState(false);
  const [page, setPage] = useState(1);

  const [activeReview, setActiveReview] = useState<UpcomingReviewDisplay | null>(
    null
  );
  const [modalStep, setModalStep] = useState<ReviewModalStep>("actions");
  const [newReviewDate, setNewReviewDate] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!supabase) {
      setError("Database connection is not configured.");
      setLoading(false);
      return;
    }

    if (clinicianPatientFilter.status === "loading") {
      setLoading(true);
      setRows([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    let assessmentQuery = supabase
      .from("Assessment")
      .select("assessment_id, PATIENTpatient_id, review_date")
      .not("review_date", "is", null)
      .order("review_date", { ascending: true })
      .limit(200);

    if (clinicianPatientFilter.status === "mine") {
      assessmentQuery = assessmentQuery.eq(
        "STAFFstaff_id",
        clinicianPatientFilter.staffId
      );
    }

    const { data: assessmentData, error: assessmentError } = await assessmentQuery;

    if (assessmentError) {
      setError(`Upcoming reviews query failed: ${assessmentError.message}`);
      setLoading(false);
      return;
    }

    const assessments = dedupeAssessmentsByPatient(
      (assessmentData ?? []) as AssessmentRow[]
    );

    if (assessments.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    const patientIds = [...new Set(assessments.map((a) => a.PATIENTpatient_id))];

    const { data: patientData, error: patientError } = await supabase
      .from("Patient")
      .select("patient_id, nhi_number")
      .in("patient_id", patientIds);

    if (patientError) {
      setError(`Patient query failed: ${patientError.message}`);
      setLoading(false);
      return;
    }

    const { data: patientNameData, error: patientNameError } = await supabase
      .from("Patient Name")
      .select("PATIENTpatient_id, given_name, family_name")
      .in("PATIENTpatient_id", patientIds);

    if (patientNameError) {
      setError(`Patient Name query failed: ${patientNameError.message}`);
      setLoading(false);
      return;
    }

    const patients = (patientData ?? []) as PatientRow[];
    const patientNames = (patientNameData ?? []) as PatientNameRow[];

    const patientMap = new Map<number, PatientRow>();
    patients.forEach((p) => patientMap.set(p.patient_id, p));

    const nameMap = new Map<number, PatientNameRow>();
    patientNames.forEach((n) => nameMap.set(n.PATIENTpatient_id, n));

    const seenNhi = new Set<string>();
    const mappedRows: UpcomingReviewDisplay[] = [];

    for (const assessment of assessments) {
      const patient = patientMap.get(assessment.PATIENTpatient_id);
      const nhiKey = (patient?.nhi_number ?? `pid-${assessment.PATIENTpatient_id}`)
        .trim()
        .toUpperCase();
      if (seenNhi.has(nhiKey)) continue;
      seenNhi.add(nhiKey);

      const name = nameMap.get(assessment.PATIENTpatient_id);
      const reviewDate = formatReviewDate(assessment.review_date);

      mappedRows.push({
        id: assessment.assessment_id,
        patientId: assessment.PATIENTpatient_id,
        nhi: patient?.nhi_number ?? "N/A",
        patientName: name
          ? `${name.given_name} ${name.family_name}`
          : `Patient #${assessment.PATIENTpatient_id}`,
        date: reviewDate.formatted,
        isToday: reviewDate.isToday,
        isOverdue: reviewDate.isOverdue,
        reviewDateMs: reviewDate.reviewDateMs,
        reviewDateRaw: assessment.review_date.slice(0, 10),
      });
    }

    setRows(mappedRows);
    setLoading(false);
  }, [clinicianPatientFilter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filterLoading = clinicianPatientFilter.status === "loading";

  const { sortedRows, dueCount } = useMemo(() => {
    const list = filterLoading ? [] : rows;
    const isDue = (row: UpcomingReviewDisplay) => row.isToday || row.isOverdue;

    const due = list.filter(isDue).length;
    const sorted = [...list].sort((a, b) => {
      const aDue = isDue(a);
      const bDue = isDue(b);
      if (aDue !== bDue) return aDue ? -1 : 1;
      return a.reviewDateMs - b.reviewDateMs;
    });
    return { sortedRows: sorted, dueCount: due };
  }, [rows, filterLoading]);

  useEffect(() => {
    setPage(1);
  }, [clinicianPatientFilter]);

  const totalCount = sortedRows.length;
  const paginatedRows = sortedRows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [page, totalCount]);

  function openReviewModal(row: UpcomingReviewDisplay) {
    setActiveReview(row);
    setModalStep("actions");
    setNewReviewDate(row.reviewDateRaw);
    setActionError(null);
  }

  function closeReviewModal() {
    if (actionLoading) return;
    setActiveReview(null);
    setModalStep("actions");
    setActionError(null);
  }

  async function clearPatientReviewDates(patientId: number) {
    if (!supabase) throw new Error("Database connection is not configured.");
    const { error: updateError } = await supabase
      .from("Assessment")
      .update({ review_date: null })
      .eq("PATIENTpatient_id", patientId)
      .not("review_date", "is", null);
    if (updateError) throw new Error(updateError.message);
  }

  async function setPatientReviewDate(patientId: number, reviewDate: string) {
    if (!supabase) throw new Error("Database connection is not configured.");
    const { error: updateError } = await supabase
      .from("Assessment")
      .update({ review_date: reviewDate })
      .eq("PATIENTpatient_id", patientId)
      .not("review_date", "is", null);
    if (updateError) throw new Error(updateError.message);
  }

  async function handleMarkReviewed() {
    if (!activeReview) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await clearPatientReviewDates(activeReview.patientId);
      closeReviewModal();
      await loadReviews();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update review.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveReviewDate() {
    if (!activeReview || !newReviewDate) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await setPatientReviewDate(activeReview.patientId, newReviewDate);
      closeReviewModal();
      await loadReviews();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not update review date.");
    } finally {
      setActionLoading(false);
    }
  }

  const headerCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    textAlign: "center",
    borderBottom: "1px solid #D6D6D6",
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
    borderBottom: "1px solid #E5E7EB",
    textAlign: "center",
  };

  const modalButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    border: "1px solid #D6D6D6",
    backgroundColor: "#FFFFFF",
    color: "#15284C",
    textAlign: "left",
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #D6D6D6",
          padding: "18px",
          width: "100%",
          color: "#15284C",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "14px",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Upcoming Reviews
          </h2>
          <div
            style={{ position: "relative", flexShrink: 0 }}
            onMouseEnter={() => setBellHover(true)}
            onMouseLeave={() => setBellHover(false)}
          >
            <button
              type="button"
              aria-label={
                dueCount > 0
                  ? `${dueCount} review${dueCount === 1 ? "" : "s"} due today or overdue`
                  : "No reviews due today or overdue"
              }
              title={
                dueCount > 0
                  ? `${dueCount} review${dueCount === 1 ? "" : "s"} due today or overdue`
                  : "No reviews due today or overdue"
              }
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
                margin: 0,
                border: "none",
                background: "transparent",
                cursor: "default",
                borderRadius: "8px",
                color: "inherit",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                style={{ display: "block", color: dueCount > 0 ? "#DC2626" : "#15284C" }}
              >
                <path
                  d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7zM13.73 21a2 2 0 01-3.46 0"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {dueCount > 0 ? (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    minWidth: "20px",
                    height: "20px",
                    padding: "0 5px",
                    borderRadius: "999px",
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    lineHeight: "20px",
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  {dueCount > 99 ? "99+" : dueCount}
                </span>
              ) : null}
            </button>
            {bellHover ? (
              <div
                role="tooltip"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  padding: "10px 14px",
                  backgroundColor: "#15284C",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  zIndex: 30,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                  pointerEvents: "none",
                }}
              >
                {dueCount === 0
                  ? "No reviews due today or overdue"
                  : `${dueCount} review${dueCount === 1 ? "" : "s"} due today or overdue`}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>NHI</th>
                <th style={headerCellStyle}>Patient Name</th>
                <th style={headerCellStyle}>Date</th>
              </tr>
            </thead>

            <tbody>
              {loading || filterLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#6B7280",
                    }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "red",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#6B7280",
                    }}
                  >
                    No upcoming reviews
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isDue = row.isToday || row.isOverdue;
                  const defaultBg = isDue ? "#FEF2F2" : "transparent";
                  return (
                    <tr
                      key={row.patientId}
                      onClick={() => openReviewModal(row)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDue ? "#FEE2E2" : "#F8FAFC";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = defaultBg;
                      }}
                      style={{
                        cursor: "pointer",
                        backgroundColor: defaultBg,
                      }}
                    >
                      <td style={{ ...bodyCellStyle, color: isDue ? "#DC2626" : "#15284C" }}>
                        {row.nhi}
                      </td>
                      <td style={{ ...bodyCellStyle, color: isDue ? "#DC2626" : "#15284C" }}>
                        {row.patientName}
                      </td>
                      <td
                        style={{
                          ...bodyCellStyle,
                          color: isDue ? "#DC2626" : "#15284C",
                          fontWeight: isDue ? 600 : 400,
                        }}
                      >
                        {row.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && !error && totalCount > 0 && (
          <TablePagination
            page={page}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {activeReview ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={closeReviewModal}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upcoming-review-dialog-title"
            style={{ maxWidth: "420px", padding: "24px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="upcoming-review-dialog-title"
              style={{
                margin: "0 0 6px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#15284C",
              }}
            >
              {modalStep === "actions" ? "Review follow-up" : "Change review date"}
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#5C667A" }}>
              {activeReview.patientName} ? NHI {activeReview.nhi}
            </p>

            {actionError ? (
              <div
                role="alert"
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#FEE2E2",
                  color: "#991B1B",
                  fontSize: "14px",
                  border: "1px solid #FCA5A5",
                }}
              >
                {actionError}
              </div>
            ) : null}

            {modalStep === "actions" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  disabled={actionLoading}
                  style={modalButtonStyle}
                  onClick={handleMarkReviewed}
                >
                  Review complete - remove from list
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  style={modalButtonStyle}
                  onClick={() => {
                    setModalStep("change-date");
                    setActionError(null);
                  }}
                >
                  Change review date
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  style={{
                    ...modalButtonStyle,
                    textAlign: "center",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#6B7280",
                  }}
                  onClick={closeReviewModal}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#5C667A" }}>
                    New review date
                  </span>
                  <input
                    type="date"
                    value={newReviewDate}
                    onChange={(e) => setNewReviewDate(e.target.value)}
                    disabled={actionLoading}
                    style={{
                      padding: "10px 12px",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      border: "1px solid #D6D6D6",
                      borderRadius: "6px",
                      color: "#15284C",
                    }}
                  />
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    disabled={actionLoading || !newReviewDate}
                    style={{
                      ...modalButtonStyle,
                      flex: 1,
                      textAlign: "center",
                      backgroundColor: "#33476D",
                      color: "#FFFFFF",
                      border: "none",
                    }}
                    onClick={handleSaveReviewDate}
                  >
                    {actionLoading ? "Saving???" : "Save date"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    style={{
                      ...modalButtonStyle,
                      flex: 1,
                      textAlign: "center",
                    }}
                    onClick={() => {
                      setModalStep("actions");
                      setActionError(null);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
