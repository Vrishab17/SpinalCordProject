import Header from "@/components/layout/Header";
import Buttons from "@/components/landing/buttons";
import RecentAssessments from "@/components/landing/recentAssessments";
import UpcomingReviews from "@/components/landing/upcoming";
import Drafts from "@/components/landing/drafts";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />

      <div
        style={{
          flex: 1,
          overflow: "auto",
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
          className="dashboard-header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexShrink: 0,
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

          <Buttons />
        </div>

        <div
          className="dashboard-grid"
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
            style={{
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <RecentAssessments />
          </div>

          <div
            className="dashboard-sidebar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ flex: "0 1 auto", maxHeight: "50%", minHeight: 0, overflow: "hidden" }}>
              <UpcomingReviews />
            </div>

            <div style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>
              <Drafts />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}