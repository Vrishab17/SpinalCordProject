type ShowAllAssessmentsToggleProps = {
  showAll: boolean;
  onChange: (showAll: boolean) => void;
};

export default function ShowAllAssessmentsToggle({
  showAll,
  onChange,
}: ShowAllAssessmentsToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={showAll}
        aria-label="Show all assessments"
        onClick={() => onChange(!showAll)}
        style={{
          position: "relative",
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          backgroundColor: showAll ? "#15284C" : "#D1D5DB",
          transition: "background-color 0.15s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: showAll ? "23px" : "3px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.15s ease",
          }}
        />
      </button>
      <span
        style={{
          fontSize: "14px",
          color: "#15284C",
          fontWeight: 500,
          userSelect: "none",
        }}
      >
        Show all assessments
      </span>
    </div>
  );
}
