import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmPatientContent from "./ConfirmPatientContent";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/lib/supabaseClient", () => ({
  supabase: { from: jest.fn() },
}));

jest.mock("@/components/layout/Header", () => {
  function MockHeader() {
    return <div data-testid="header" />;
  }
  MockHeader.displayName = "MockHeader";
  return MockHeader;
});

const FORM_DATA = {
  firstName: "Jane",
  lastName: "Doe",
  preferredName: "",
  prefix: "Dr",
  dateOfBirth: "1990-01-15",
  ethnicity: "New Zealand European",
  gender: "Female",
  nzCitizenshipStatus: "NZ Citizen",
  placeOfBirth: "Auckland",
  phoneNumber: "0211234567",
  homePhoneNumber: "",
  emailAddress: "jane@example.com",
  nhiNumber: "ABC1234",
  addressLine1: "123 Main St",
  addressLine2: "",
  city: "Auckland",
  suburb: "CBD",
  postalCode: "1010",
  dateOfInjury: "2024-06-01",
  injuryCause: "MVA",
  notes: "",
};

function makeSearchParams(data: object | null) {
  return {
    get: (key: string) => {
      if (key === "data" && data !== null) {
        return encodeURIComponent(JSON.stringify(data));
      }
      return null;
    },
  };
}

const pushMock = jest.fn();

describe("ConfirmPatientContent", () => {
  beforeEach(() => {
    pushMock.mockReset();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (supabase.from as jest.Mock).mockReset();
  });

  it("shows 'No patient data provided' when the search param is missing", () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(null));
    render(<ConfirmPatientContent />);
    expect(screen.getByText(/No patient data provided/i)).toBeInTheDocument();
  });

  it("renders the patient summary from URL params", () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(FORM_DATA));
    render(<ConfirmPatientContent />);

    expect(screen.getByText(/New Patient Confirmation/i)).toBeInTheDocument();
    expect(screen.getByText("Doe, Jane")).toBeInTheDocument();
    expect(screen.getByText("ABC1234")).toBeInTheDocument();
    expect(screen.getByText("Dr")).toBeInTheDocument();
  });

  it("Register Patient and Register & Start Assessment buttons are disabled without consent", () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(FORM_DATA));
    render(<ConfirmPatientContent />);

    expect(screen.getByRole("button", { name: /^Register Patient$/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Register & Start Assessment/i })
    ).toBeDisabled();
  });

  it("Register Patient button becomes enabled after checking the consent checkbox", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(FORM_DATA));
    render(<ConfirmPatientContent />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByRole("button", { name: /^Register Patient$/i })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /Register & Start Assessment/i })
    ).toBeEnabled();
  });

  it("Edit button navigates back to the new patient form with current data", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(FORM_DATA));
    render(<ConfirmPatientContent />);

    await userEvent.click(screen.getByRole("button", { name: /← Edit/i }));

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("/patients/new?data=")
    );
  });

  it("consent checkbox is unchecked by default", () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(FORM_DATA));
    render(<ConfirmPatientContent />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("displays 'Not recorded' for optional fields that are empty", () => {
    (useSearchParams as jest.Mock).mockReturnValue(makeSearchParams(FORM_DATA));
    render(<ConfirmPatientContent />);
    const notRecordedCells = screen.getAllByText("Not recorded");
    expect(notRecordedCells.length).toBeGreaterThan(0);
  });
});
