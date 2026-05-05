import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InjuryInformationSection from "./InjuryInformationSection";

const emptyForm = {
  firstName: "",
  lastName: "",
  preferredName: "",
  prefix: "",
  dateOfBirth: "",
  ethnicity: "",
  gender: "",
  nzCitizenshipStatus: "",
  placeOfBirth: "",
  phoneNumber: "",
  homePhoneNumber: "",
  emailAddress: "",
  nhiNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  suburb: "",
  postalCode: "",
  dateOfInjury: "",
  injuryCause: "",
  notes: "",
};

describe("InjuryInformationSection", () => {
  it("renders the section heading", () => {
    render(<InjuryInformationSection formData={emptyForm} onChange={jest.fn()} />);
    expect(screen.getByText("INJURY INFORMATION")).toBeInTheDocument();
  });

  it("renders date of injury, injury cause, and notes fields", () => {
    render(<InjuryInformationSection formData={emptyForm} onChange={jest.fn()} />);
    expect(screen.getByLabelText(/DATE OF INJURY/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/INJURY CAUSE/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NOTES/i)).toBeInTheDocument();
  });

  it("reflects formData values in the fields", () => {
    const formData = { ...emptyForm, injuryCause: "MVA", notes: "Some notes" };
    render(<InjuryInformationSection formData={formData} onChange={jest.fn()} />);
    expect(screen.getByLabelText(/INJURY CAUSE/i)).toHaveValue("MVA");
    expect(screen.getByLabelText(/NOTES/i)).toHaveValue("Some notes");
  });

  it("calls onChange when notes textarea is edited", async () => {
    const onChange = jest.fn();
    render(<InjuryInformationSection formData={emptyForm} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/NOTES/i), "x");
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onChange when injury cause input is edited", async () => {
    const onChange = jest.fn();
    render(<InjuryInformationSection formData={emptyForm} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/INJURY CAUSE/i), "Fall");
    expect(onChange).toHaveBeenCalled();
  });
});
