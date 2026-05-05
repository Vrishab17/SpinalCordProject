import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewPatientActions from "./NewPatientActions";

describe("NewPatientActions", () => {
  it("calls cancel and review handlers", async () => {
    const onCancel = jest.fn();
    const onReview = jest.fn();

    render(<NewPatientActions onCancel={onCancel} onReview={onReview} />);

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    await userEvent.click(screen.getByRole("button", { name: /review & confirm/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledTimes(1);
  });

  it("respects custom review label and disabled state", () => {
    render(
      <NewPatientActions
        onCancel={jest.fn()}
        onReview={jest.fn()}
        reviewLabel="Checking..."
        reviewDisabled
      />
    );

    const reviewButton = screen.getByRole("button", { name: "Checking..." });
    expect(reviewButton).toBeDisabled();
  });
});
