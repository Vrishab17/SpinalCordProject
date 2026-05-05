import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonalDetailsSection from "./PersonalDetailsSection";

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

describe("PersonalDetailsSection", () => {
  it("renders the section heading", () => {
    render(<PersonalDetailsSection formData={emptyForm} onChange={jest.fn()} />);
    expect(screen.getByText("PERSONAL DETAILS")).toBeInTheDocument();
    expect(screen.getByText("* required")).toBeInTheDocument();
  });

  it("renders all required field labels", () => {
    render(<PersonalDetailsSection formData={emptyForm} onChange={jest.fn()} />);
    const requiredLabels = [
      "NHI NUMBER *",
      "PREFIX *",
      "FIRST NAME *",
      "SURNAME *",
      "DATE OF BIRTH *",
      "GENDER *",
      "ETHNICITY *",
      "PLACE OF BIRTH *",
      "NZ CITIZENSHIP STATUS *",
      "ADDRESS LINE 1 *",
      "CITY *",
      "SUBURB *",
      "POSTCODE *",
    ];
    for (const label of requiredLabels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("reflects formData values in inputs", () => {
    const formData = { ...emptyForm, nhiNumber: "ABC9999", firstName: "Jane", lastName: "Doe" };
    render(<PersonalDetailsSection formData={formData} onChange={jest.fn()} />);

    expect(screen.getByLabelText(/NHI NUMBER/i)).toHaveValue("ABC9999");
    expect(screen.getByLabelText(/FIRST NAME/i)).toHaveValue("Jane");
    expect(screen.getByLabelText(/SURNAME/i)).toHaveValue("Doe");
  });

  it("calls onChange when an input is changed", async () => {
    const onChange = jest.fn();
    render(<PersonalDetailsSection formData={emptyForm} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/FIRST NAME/i), "A");
    expect(onChange).toHaveBeenCalled();
  });

  it("prefix select has standard clinical prefix options", () => {
    render(<PersonalDetailsSection formData={emptyForm} onChange={jest.fn()} />);
    const prefixSelect = screen.getByLabelText(/PREFIX/i);
    const optionValues = Array.from((prefixSelect as HTMLSelectElement).options).map(
      (o) => o.value
    );
    expect(optionValues).toEqual(
      expect.arrayContaining(["Mr", "Mrs", "Ms", "Dr", "Prof"])
    );
  });

  it("gender select has Male, Female, and Other options", () => {
    render(<PersonalDetailsSection formData={emptyForm} onChange={jest.fn()} />);
    const genderSelect = screen.getByLabelText(/GENDER/i);
    const optionValues = Array.from((genderSelect as HTMLSelectElement).options).map(
      (o) => o.value
    );
    expect(optionValues).toEqual(expect.arrayContaining(["Male", "Female", "Other"]));
  });

  it("calls onChange when a select value changes", async () => {
    const onChange = jest.fn();
    render(<PersonalDetailsSection formData={emptyForm} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText(/GENDER/i), "Female");
    expect(onChange).toHaveBeenCalled();
  });
});
