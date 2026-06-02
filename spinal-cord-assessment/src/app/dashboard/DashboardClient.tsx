"use client";

import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/layout/Header";
import Buttons from "@/components/landing/buttons";
import RecentAssessments from "@/components/landing/recentAssessments";
import UpcomingReviews from "@/components/landing/upcoming";
import ShowAllAssessmentsToggle from "@/components/landing/ShowAllAssessmentsToggle";
import { useClinicianPatientFilter } from "@/lib/useClinicianPatientFilter";

export default function DashboardClient() {
  const { showAllAssessments, setShowAllAssessments, clinicianFilter } =
    useClinicianPatientFilter();

  return (
    <AuthGuard>
      <main
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F6F4EC",
        }}
      >
        <Header />

        <div
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
            <h1
              style={{
                fontSize: "40px",
                fontWeight: 700,
                margin: 0,
                color: "#15284C",
              }}
            >
              ISNCSCI / ASRU
            </h1>

            <div
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
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <div
              style={{
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <RecentAssessments clinicianPatientFilter={clinicianFilter} />
            </div>

            <div
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
    </AuthGuard>
  );
}
