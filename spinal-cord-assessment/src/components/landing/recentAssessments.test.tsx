import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecentAssessments from "./recentAssessments";
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

describe("RecentAssessments", () => {
  it("shows Loading... on initial render", () => {
    fromMock.mockReturnValue({
      select: () => ({
        order: () => ({
          limit: () => new Promise(() => {}),
        }),
      }),
    });

    render(<RecentAssessments />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the Assessment query fails", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Assessment") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({
                data: null,
                error: { message: "assessment fetch failed" },
              }),
            }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<RecentAssessments />);
    expect(
      await screen.findByText(/assessment query failed: assessment fetch failed/i)
    ).toBeInTheDocument();
  });

  it("shows 'No recent assessments' when the table is empty", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Assessment") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      return { select: () => ({ in: async () => ({ data: [], error: null }) }) };
    });

    render(<RecentAssessments />);
    expect(
      await screen.findByText(/No recent assessments to display/i)
    ).toBeInTheDocument();
  });

  it("renders rows with NHI, patient name, date, version and status", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Assessment") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({
                data: [
                  {
                    assessment_id: 10,
                    assessment_date: "2024-05-15",
                    status: "FINALISED",
                    current_version: 2,
                    PATIENTpatient_id: 99,
                  },
                ],
                error: null,
              }),
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

    render(<RecentAssessments />);

    await waitFor(() => {
      expect(screen.getByText("XYZ9999")).toBeInTheDocument();
    });
    expect(screen.getByText("Alex Brown")).toBeInTheDocument();
    expect(screen.getByText("v2")).toBeInTheDocument();
    expect(screen.getByText("FINALISED")).toBeInTheDocument();
    expect(screen.getByText("15/05/2024")).toBeInTheDocument();
  });

  it("clicking a row navigates to that patient's history page", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Assessment") {
        return {
          select: () => ({
            order: () => ({
              limit: async () => ({
                data: [
                  {
                    assessment_id: 10,
                    assessment_date: "2024-05-15",
                    status: "DRAFT",
                    current_version: 1,
                    PATIENTpatient_id: 99,
                  },
                ],
                error: null,
              }),
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

    render(<RecentAssessments />);
    const row = await screen.findByText("XYZ9999");
    await userEvent.click(row.closest("tr")!);
    expect(pushMock).toHaveBeenCalledWith("/history/99");
  });
});
