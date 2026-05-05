import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Drafts from "./drafts";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/supabaseClient", () => ({
  supabase: { from: jest.fn() },
}));

const fromMock = supabase.from as unknown as jest.Mock;
const useRouterMock = useRouter as jest.Mock;
const pushMock = jest.fn();

beforeEach(() => {
  pushMock.mockReset();
  useRouterMock.mockReturnValue({ push: pushMock });
  fromMock.mockReset();
});

describe("Drafts (Pending Drafts panel)", () => {
  it("shows Loading... on initial render", () => {
    fromMock.mockReturnValue({
      select: () => ({
        eq: () => new Promise(() => {}),
      }),
    });

    render(<Drafts />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the Draft Assessment query fails", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Draft Assessment") {
        return {
          select: () => ({
            eq: async () => ({
              data: null,
              error: { message: "draft table offline" },
            }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<Drafts />);
    expect(
      await screen.findByText(/draft query failed: draft table offline/i)
    ).toBeInTheDocument();
  });

  it("shows 'No drafts yet' when no current drafts exist", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Draft Assessment") {
        return {
          select: () => ({
            eq: async () => ({ data: [], error: null }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<Drafts />);
    expect(await screen.findByText(/No drafts yet/i)).toBeInTheDocument();
  });

  it("renders a draft row with NHI, patient name, version and status", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Draft Assessment") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  draft_id: 1,
                  ASSESSMENTassessment_id: 5,
                  last_saved_at: "2024-05-10T09:00:00Z",
                  is_current_draft: "true",
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "Assessment") {
        return {
          select: () => ({
            in: async () => ({
              data: [
                { assessment_id: 5, PATIENTpatient_id: 99, current_version: 3, status: "DRAFT" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "Patient") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ patient_id: 99, nhi_number: "XYZ9999" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "Patient Name") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ PATIENTpatient_id: 99, given_name: "Alex", family_name: "Brown" }],
              error: null,
            }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<Drafts />);

    await waitFor(() => {
      expect(screen.getByText("XYZ9999")).toBeInTheDocument();
    });
    expect(screen.getByText("Alex Brown")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("normalizes FINALISED status to 'Finalized'", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Draft Assessment") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  draft_id: 2,
                  ASSESSMENTassessment_id: 7,
                  last_saved_at: "2024-04-01T08:00:00Z",
                  is_current_draft: "true",
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "Assessment") {
        return {
          select: () => ({
            in: async () => ({
              data: [
                { assessment_id: 7, PATIENTpatient_id: 100, current_version: 1, status: "FINALISED" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "Patient") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ patient_id: 100, nhi_number: "AAA0001" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "Patient Name") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ PATIENTpatient_id: 100, given_name: "Bo", family_name: "Lee" }],
              error: null,
            }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<Drafts />);
    expect(await screen.findByText("Finalized")).toBeInTheDocument();
  });

  it("clicking a row navigates to the patient's history", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Draft Assessment") {
        return {
          select: () => ({
            eq: async () => ({
              data: [
                {
                  draft_id: 1,
                  ASSESSMENTassessment_id: 5,
                  last_saved_at: "2024-05-10T09:00:00Z",
                  is_current_draft: "true",
                },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "Assessment") {
        return {
          select: () => ({
            in: async () => ({
              data: [
                { assessment_id: 5, PATIENTpatient_id: 99, current_version: 1, status: "DRAFT" },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === "Patient") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ patient_id: 99, nhi_number: "XYZ9999" }],
              error: null,
            }),
          }),
        };
      }
      if (table === "Patient Name") {
        return {
          select: () => ({
            in: async () => ({
              data: [{ PATIENTpatient_id: 99, given_name: "Alex", family_name: "Brown" }],
              error: null,
            }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<Drafts />);
    const row = await screen.findByText("XYZ9999");
    await userEvent.click(row.closest("tr")!);
    expect(pushMock).toHaveBeenCalledWith("/history/99");
  });
});
