type Props = {
  onCancel: () => void;
  onReview: () => void | Promise<void>;
  reviewLabel?: string;
  reviewDisabled?: boolean;
};

export default function NewPatientActions({
  onCancel,
  onReview,
  reviewLabel = "Review & Confirm →",
  reviewDisabled = false,
}: Props) {
  return (
    <div
      style={{
        padding: "0 18px 22px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        onClick={onCancel}
        style={{
          minWidth: "200px",
          height: "48px",
          border: "1px solid #5F6F8C",
          backgroundColor: "#FFFFFF",
          color: "#15284C",
          fontSize: "16px",
          fontWeight: 400,
          cursor: "pointer",
        }}
      >
        ← Cancel
      </button>

      <button
        type="button"
        onClick={onReview}
        disabled={reviewDisabled}
        style={{
          minWidth: "220px",
          height: "48px",
          border: "none",
          backgroundColor: "#2D3E5E",
          color: "#FFFFFF",
          fontSize: "16px",
          fontWeight: 600,
          cursor: reviewDisabled ? "not-allowed" : "pointer",
          opacity: reviewDisabled ? 0.6 : 1,
        }}
      >
        {reviewLabel}
      </button>
    </div>
  );
}