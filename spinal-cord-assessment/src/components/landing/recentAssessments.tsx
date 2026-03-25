"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getAssessmentStatusColor } from "@/lib/displayFormatters";
import {
  fetchRecentAssessmentsDisplay,
  type RecentAssessmentDisplay,
} from "@/lib/recentAssessmentsFetch";

export default function RecentAssessments() {
  const router = useRouter();

  const [rows, setRows] = useState<RecentAssessmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const { rows, error } = await fetchRecentAssessmentsDisplay(supabase);
      if (cancelled) return;
      if (error) setError(error);
      else setRows(rows);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const headerCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    textAlign: "left",
    borderBottom: "1px solid #D6D6D6",
  };

  const bodyCellStyle: React.CSSProperties = {
    padding: "14px 12px",
    minHeight: "48px",
    verticalAlign: "middle",
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D6D6D6",
        padding: "18px",
        color: "#15284C",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          margin: "0 0 14px 0",
          flexShrink: 0,
        }}
      >
        Recent Assessments
      </h2>

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
            color: "#15284C",
          }}
        >
          <thead>
            <tr>
              <th style={headerCellStyle}>NHI Number</th>
              <th style={headerCellStyle}>Patient Name</th>
              <th style={headerCellStyle}>Date</th>
              <th style={headerCellStyle}>Version Number</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  No recent assessments to display.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/history/${row.patientId}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.nhiNumber}</td>
                  <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.patientName}</td>
                  <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.date}</td>
                  <td style={{ ...bodyCellStyle, borderBottom: "1px solid #E5E7EB" }}>{row.versionNumber}</td>
                  <td
                    style={{
                      ...bodyCellStyle,
                      borderBottom: "1px solid #E5E7EB",
                      color: getAssessmentStatusColor(row.status),
                    }}
                  >
                    {row.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}