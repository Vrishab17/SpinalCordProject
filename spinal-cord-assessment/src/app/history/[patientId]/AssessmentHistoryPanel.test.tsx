import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AssessmentHistoryPanel, {
  type AssessmentDisplay,
} from "./AssessmentHistoryPanel";

const ASSESSMENTS: AssessmentDisplay[] = [
  {
    assessment_id: 1,
    assessment_date: "2024-03-10",
    status: "FINALISED",
    clinicianName: "Dr J. Smith",
    alsGrade: "B",
  },
  {
    assessment_id: 2,
    assessment_date: "2024-01-05",
    status: "DRAFT",
    clinicianName: "Dr A. Jones",
    alsGrade: null,
  },
];

const baseProps = { patientName: "John Doe", nhiNumber: "ABC1234" };

describe("AssessmentHistoryPanel", () => {
  it("shows 'No assessments found' when the list is empty", () => {
    render(<AssessmentHistoryPanel assessments={[]} {...baseProps} />);
    expect(screen.getByText(/No assessments found/i)).toBeInTheDocument();
  });

  it("renders rows with clinician name, AIS grade and status", () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    expect(screen.getByText("Dr J. Smith")).toBeInTheDocument();
    expect(screen.getByText("GRADE B")).toBeInTheDocument();
    expect(screen.getByText("FINAL")).toBeInTheDocument();
    expect(screen.getByText("Dr A. Jones")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.getByText("DRAFT")).toBeInTheDocument();
  });

  it("normalizes FINALISED to FINAL in the table", () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    expect(screen.queryByText("FINALISED")).not.toBeInTheDocument();
    expect(screen.getByText("FINAL")).toBeInTheDocument();
  });

  it("each row has an Open link pointing to the correct assessmentId", () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    const openLinks = screen.getAllByRole("link", { name: /open/i });
    expect(openLinks).toHaveLength(2);
    expect(openLinks[0]).toHaveAttribute("href", "/assessment?assessmentId=1");
    expect(openLinks[1]).toHaveAttribute("href", "/assessment?assessmentId=2");
  });

  it("Filter button opens the dropdown", async () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    expect(screen.queryByText(/FILTER BY/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /filter/i }));
    expect(screen.getByText(/FILTER BY/i)).toBeInTheDocument();
  });

  it("filtering by status shows only matching rows", async () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /filter/i }));
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "FINAL");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText("Dr J. Smith")).toBeInTheDocument();
    expect(screen.queryByText("Dr A. Jones")).not.toBeInTheDocument();
  });

  it("shows 'No assessments match' when filters exclude all rows", async () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /filter/i }));
    await userEvent.selectOptions(screen.getAllByRole("combobox")[0], "Dr J. Smith");
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "DRAFT");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText(/No assessments match the current filters/i)).toBeInTheDocument();
  });

  it("Clear button inside the dropdown removes active filters and restores rows", async () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /filter/i }));
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "FINAL");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.queryByText("Dr A. Jones")).not.toBeInTheDocument();

    // Re-open filter: use ^Filter so "Remove FINAL filter" tag doesn't collide
    await userEvent.click(screen.getByRole("button", { name: /^Filter/i }));
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByText("Dr J. Smith")).toBeInTheDocument();
    expect(screen.getByText("Dr A. Jones")).toBeInTheDocument();
  });

  it("shows an active filter badge count on the Filter button after applying", async () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /filter/i }));
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "FINAL");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("clicking × on an active filter tag removes that specific filter", async () => {
    render(<AssessmentHistoryPanel assessments={ASSESSMENTS} {...baseProps} />);
    await userEvent.click(screen.getByRole("button", { name: /filter/i }));
    await userEvent.selectOptions(screen.getAllByRole("combobox")[2], "FINAL");
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));

    await userEvent.click(screen.getByRole("button", { name: /remove final filter/i }));

    expect(screen.getByText("Dr J. Smith")).toBeInTheDocument();
    expect(screen.getByText("Dr A. Jones")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
