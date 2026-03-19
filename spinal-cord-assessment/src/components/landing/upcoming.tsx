"use client";

export default function UpcomingReviews() {
  const reviews = [
    { nhi: "BHD21SE", name: "Michael Turner", date: "Today", isToday: true },
    { nhi: "ABF24TH", name: "Ethan Hughes", date: "30/03/2026", isToday: false },
    { nhi: "KAQ92YG", name: "Lauren Hayes", date: "09/04/2026", isToday: false },
    { nhi: "CQY36AB", name: "Daniel Walker", date: "15/04/2026", isToday: false },
    { nhi: "ACA31FM", name: "Sarah Collins", date: "22/04/2026", isToday: false },
  ];

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
    borderBottom: "1px solid #E5E7EB",
  };

  return (
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
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          marginBottom: "14px",
          flexShrink: 0,
        }}
      >
        Upcoming Reviews
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
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "24px", textAlign: "center", color: "#6B7280" }}>
                  No upcoming reviews
                </td>
              </tr>
            ) : (
              reviews.map((review, index) => (
                <tr key={`${review.nhi}-${index}`}>
                  <td style={bodyCellStyle}>{review.nhi}</td>
                  <td style={bodyCellStyle}>{review.name}</td>
                  <td
                    style={{
                      ...bodyCellStyle,
                      color: review.isToday ? "#C0392B" : "#15284C",
                    }}
                  >
                    {review.date}
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