"use client";

import Header from "@/components/layout/Header";
import Buttons from "@/components/landing/buttons";
import RecentAssessments from "@/components/landing/recentAssessments";
import UpcomingReviews from "@/components/landing/upcoming";
import ShowAllAssessmentsToggle from "@/components/landing/ShowAllAssessmentsToggle";
import { useClinicianPatientFilter } from "@/lib/useClinicianPatientFilter";

export default function LandingPage() {
  const { showAllAssessments, setShowAllAssessments, clinicianFilter } =
    useClinicianPatientFilter();

  return (
    <main
      className="dashboard-page"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />

      <div
        className="dashboard-shell"
        style={{
          flex: 1,
          overflow: "hidden",
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
      >
        <div
          className="dashboard-header-row dashboard-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexShrink: 0,
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                margin: 0,
                color: "#15284C",
              }}
            >
              Assessment Dashboard
            </h1>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                margin: "4px 0 0",
                color: "#6B7280",
              }}
            >
              ISNCSCI / ASRU
            </p>
          </div>

          <div
            className="dashboard-actions dashboard-toolbar-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <ShowAllAssessmentsToggle
              showAll={showAllAssessments}
              onChange={setShowAllAssessments}
            />
            <Buttons />
          </div>
        </div>

        <div
          className="dashboard-content dashboard-grid dashboard-widgets-grid"
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "5fr 3fr",
            gap: "20px",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div
            className="dashboard-widget"
            style={{
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <RecentAssessments clinicianPatientFilter={clinicianFilter} />
          </div>

          <div
            className="dashboard-widget"
            style={{
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <UpcomingReviews clinicianPatientFilter={clinicianFilter} />
          </div>
        </div>
      </div>
    </main>
  );
}
