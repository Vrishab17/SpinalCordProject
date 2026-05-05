import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientSearch from "./PatientSearch";
import { supabase } from "@/lib/supabaseClient";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const fromMock = supabase.from as unknown as jest.Mock;

describe("PatientSearch", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("shows validation error when no search criteria is provided", async () => {
    render(<PatientSearch />);

    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(await screen.findByText("Enter NHI OR Last Name + DOB")).toBeInTheDocument();
  });

  it("shows not found when NHI search returns no rows", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Patient") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      };
    });

    render(<PatientSearch />);
    await userEvent.type(screen.getByPlaceholderText("e.g. ABC1234"), "ABC1234");
    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(await screen.findByText("No patient found")).toBeInTheDocument();
  });

  it("shows patient details for successful NHI lookup", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Patient") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({
                data: [
                  {
                    patient_id: 1001,
                    nhi_number: "ABC1234",
                    date_of_birth: "2000-01-15",
                    gender: "M",
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "Patient Name") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({
                data: [{ given_name: "Jane", family_name: "Doe" }],
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "GP Enrollment") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({
                data: [{ hpi_practitioner_id: "HPI-7788" }],
                error: null,
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      };
    });

    render(<PatientSearch />);
    await userEvent.type(screen.getByPlaceholderText("e.g. ABC1234"), "ABC1234");
    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(await screen.findByText(/Patient Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText(/ABC1234/)).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2000/)).toBeInTheDocument();
    expect(screen.getByText(/HPI-7788/)).toBeInTheDocument();
  });

  it("shows an error when supabase query fails during NHI search", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Patient") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({ data: null, error: { message: "network timeout" } }),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }) };
    });

    render(<PatientSearch />);
    await userEvent.type(screen.getByPlaceholderText("e.g. ABC1234"), "BAD1111");
    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(await screen.findByText(/network timeout/i)).toBeInTheDocument();
  });

  it("shows validation error when only last name is provided without DOB", async () => {
    render(<PatientSearch />);
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Smith");
    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(await screen.findByText(/Enter NHI OR Last Name \+ DOB/i)).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("shows 'Searching...' on the button while a search is in flight", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Patient") {
        return {
          select: () => ({
            eq: () => ({
              limit: () => new Promise(() => {}),
            }),
          }),
        };
      }
      return { select: () => ({ eq: () => ({ limit: async () => ({ data: [], error: null }) }) }) };
    });

    render(<PatientSearch />);
    await userEvent.type(screen.getByPlaceholderText("e.g. ABC1234"), "AAA0001");
    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(screen.getByRole("button", { name: /searching\.\.\./i })).toBeInTheDocument();
  });

  it("supports search by last name and date of birth", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Patient Name") {
        return {
          select: () => ({
            ilike: async () => ({
              data: [{ PATIENTpatient_id: 2121 }],
              error: null,
            }),
            eq: () => ({
              limit: async () => ({
                data: [{ given_name: "Alex", family_name: "Smith" }],
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "Patient") {
        return {
          select: () => ({
            in: () => ({
              eq: () => ({
                limit: async () => ({
                  data: [
                    {
                      patient_id: 2121,
                      nhi_number: "XYZ9999",
                      date_of_birth: "1989-09-01",
                      gender: "F",
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      if (table === "GP Enrollment") {
        return {
          select: () => ({
            eq: () => ({
              limit: async () => ({
                data: [],
                error: null,
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
      };
    });

    render(<PatientSearch />);
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Smith");
    await userEvent.type(document.querySelector('input[type="date"]') as Element, "1989-09-01");
    await userEvent.click(screen.getByRole("button", { name: /search nhi fhir/i }));

    expect(await screen.findByText(/Alex Smith/)).toBeInTheDocument();
    expect(screen.getByText(/XYZ9999/)).toBeInTheDocument();
    expect(screen.getByText(/Not assigned/)).toBeInTheDocument();
  });
});
