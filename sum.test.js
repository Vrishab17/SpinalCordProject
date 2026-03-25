/**
 * Utilities, Supabase helpers, API route, and UI (buttons, search, landing).
 * @jest-environment jsdom
 */

const React = require("react");
const { render, screen } = require("@testing-library/react");

const mockFrom = jest.fn();

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}));

const {
  formatDateNZ,
  compactAddress,
  formatDateShortDMY,
  getAssessmentStatusColor,
  formatReviewDate,
  sameLocalCalendarDay,
  normalizeDraftStatus,
  labelDraftStatus,
  formatDraftDateIso,
} = require("@/lib/displayFormatters");

// ─── 1) Utility / display functions ─────────────────────────────────────────

describe("displayFormatters", () => {
  describe("formatDateNZ", () => {
    it("returns N/A for null/undefined", () => {
      expect(formatDateNZ(null)).toBe("N/A");
      expect(formatDateNZ(undefined)).toBe("N/A");
    });

    it("formats a valid ISO date", () => {
      const s = formatDateNZ("1955-05-19");
      expect(s).toMatch(/1955/);
    });
  });

  describe("compactAddress", () => {
    it("returns N/A when null", () => {
      expect(compactAddress(null)).toBe("N/A");
    });

    it("joins parts with commas", () => {
      expect(
        compactAddress({
          line1: "1 Road",
          suburb: "Suburb",
          city: "City",
          postal_code: 9012,
          country: "NZ",
        })
      ).toBe("1 Road, Suburb, City, 9012, NZ");
    });
  });

  describe("formatDateShortDMY", () => {
    it("returns dd/mm/yyyy", () => {
      expect(formatDateShortDMY("2024-03-07T00:00:00.000Z")).toMatch(
        /^\d{2}\/\d{2}\/2024$/
      );
    });
  });

  describe("getAssessmentStatusColor", () => {
    it("maps known statuses", () => {
      expect(getAssessmentStatusColor("draft")).toBe("#C96A2B");
      expect(getAssessmentStatusColor("FINALISED")).toBe("#3E8E41");
      expect(getAssessmentStatusColor("in progress")).toBe("#2F66C8");
      expect(getAssessmentStatusColor("other")).toBe("#15284C");
    });
  });

  describe("sameLocalCalendarDay", () => {
    it("is true for the same local day at different times", () => {
      expect(
        sameLocalCalendarDay(
          new Date(2024, 0, 5, 1, 0),
          new Date(2024, 0, 5, 23, 59)
        )
      ).toBe(true);
    });

    it("is false across a local midnight boundary", () => {
      expect(
        sameLocalCalendarDay(
          new Date(2024, 0, 5, 23, 0),
          new Date(2024, 0, 6, 1, 0)
        )
      ).toBe(false);
    });
  });

  describe("formatReviewDate", () => {
    it("formats other dates as dd/mm/yyyy", () => {
      const r = formatReviewDate("2031-11-02");
      expect(r.isToday).toBe(false);
      expect(r.formatted).toBe("02/11/2031");
    });
  });

  describe("draft status helpers", () => {
    it("normalizes British/American finalised spellings", () => {
      expect(normalizeDraftStatus("FINALISED")).toBe("FINALIZED");
      expect(normalizeDraftStatus("FINALIZED")).toBe("FINALIZED");
      expect(normalizeDraftStatus("open")).toBe("OPEN");
      expect(normalizeDraftStatus("anything")).toBe("DRAFT");
    });

    it("labels statuses for UI", () => {
      expect(labelDraftStatus("OPEN")).toBe("Open");
      expect(labelDraftStatus("FINALIZED")).toBe("Finalized");
      expect(labelDraftStatus("DRAFT")).toBe("Draft");
    });

    it("formats draft ISO timestamps", () => {
      expect(formatDraftDateIso("2024-01-01T00:00:00.000Z")).toBeTruthy();
    });
  });
});

// ─── 2) Supabase: fetchRecentAssessmentsDisplay ─────────────────────────────

const { fetchRecentAssessmentsDisplay } = require("@/lib/recentAssessmentsFetch");
const { supabase } = require("@/lib/supabaseClient");

describe("fetchRecentAssessmentsDisplay", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("returns rows when Assessment, Patient, and Patient Name succeed", async () => {
    mockFrom.mockImplementation((table) => {
      if (table === "Assessment") {
        return {
          select: () => ({
            order: () => ({
              limit: () =>
                Promise.resolve({
                  data: [
                    {
                      assessment_id: 10,
                      assessment_date: "2024-06-01",
                      status: "DRAFT",
                      current_version: 2,
                      PATIENTpatient_id: 1,
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
            in: () =>
              Promise.resolve({
                data: [{ patient_id: 1, nhi_number: "ABC123" }],
                error: null,
              }),
          }),
        };
      }
      if (table === "Patient Name") {
        return {
          select: () => ({
            in: () =>
              Promise.resolve({
                data: [
                  {
                    PATIENTpatient_id: 1,
                    given_name: "Sam",
                    family_name: "Smith",
                  },
                ],
                error: null,
              }),
          }),
        };
      }
      throw new Error("unexpected table: " + table);
    });

    const { rows, error } = await fetchRecentAssessmentsDisplay(supabase);
    expect(error).toBeNull();
    expect(rows).toHaveLength(1);
    expect(rows[0].nhiNumber).toBe("ABC123");
    expect(rows[0].patientName).toBe("Sam Smith");
    expect(rows[0].versionNumber).toBe("v2");
  });

  it("returns an error when Assessment query fails", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        order: () => ({
          limit: () =>
            Promise.resolve({
              data: null,
              error: { message: "boom" },
            }),
        }),
      }),
    }));

    const { rows, error } = await fetchRecentAssessmentsDisplay(supabase);
    expect(rows).toEqual([]);
    expect(error).toContain("Assessment query failed");
  });
});

// ─── 3) API route GET /api/test ─────────────────────────────────────────────

describe("GET /api/test", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("returns ok and count when Supabase succeeds", async () => {
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() => Promise.resolve({ error: null, count: 12 })),
    }));

    const { GET } = require("@/app/api/test/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.table).toBe("Patient");
    expect(body.count).toBe(12);
    expect(mockFrom).toHaveBeenCalledWith("Patient");
  });

  it("returns 500 when Supabase reports an error", async () => {
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() =>
        Promise.resolve({ error: { message: "RLS denied" }, count: null })
      ),
    }));

    const { GET } = require("@/app/api/test/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.message).toContain("RLS denied");
  });
});

// ─── 4) Components ──────────────────────────────────────────────────────────

const Buttons = require("@/components/landing/buttons").default;
const PatientSearch = require("@/components/patients/PatientSearch").default;
const AssessmentForm = require("@/components/assessment/AssessmentForm").default;
const PatientsPage = require("@/app/patients/patientsPage").default;

jest.mock("@/components/layout/Header", () => ({
  __esModule: true,
  default: function MockHeader() {
    return React.createElement("header", { "data-testid": "mock-header" }, "Header");
  },
}));

jest.mock("@/components/landing/recentAssessments", () => ({
  __esModule: true,
  default: function MockRecent() {
    return React.createElement("div", { "data-testid": "mock-recent" }, "Recent");
  },
}));

jest.mock("@/components/landing/upcoming", () => ({
  __esModule: true,
  default: function MockUpcoming() {
    return React.createElement("div", { "data-testid": "mock-upcoming" }, "Upcoming");
  },
}));

jest.mock("@/components/landing/drafts", () => ({
  __esModule: true,
  default: function MockDrafts() {
    return React.createElement("div", { "data-testid": "mock-drafts" }, "Drafts");
  },
}));

const LandingPage = require("@/app/landingPage/landingPage").default;

describe("Buttons (landing actions)", () => {
  it("renders Search Patient and + New Patient buttons", () => {
    render(React.createElement(Buttons));
    expect(
      screen.getByRole("button", { name: /search patient/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /new patient/i })
    ).toBeInTheDocument();
  });
});

describe("PatientSearch (search bar placeholder)", () => {
  it("renders the patient search label text", () => {
    render(React.createElement(PatientSearch));
    expect(
      screen.getByText(/patient search component/i)
    ).toBeInTheDocument();
  });
});

describe("AssessmentForm", () => {
  it("renders placeholder content", () => {
    render(React.createElement(AssessmentForm));
    expect(screen.getByText(/assesment form/i)).toBeInTheDocument();
  });
});

describe("PatientsPage (search area)", () => {
  it("shows page title and embeds PatientSearch", () => {
    render(React.createElement(PatientsPage));
    expect(screen.getByRole("heading", { name: /patient search/i })).toBeInTheDocument();
    expect(screen.getByText(/patient search component/i)).toBeInTheDocument();
  });
});

describe("LandingPage", () => {
  it("renders title, header slot, action area, and section placeholders", () => {
    render(React.createElement(LandingPage));
    expect(screen.getByRole("heading", { name: /ISNCSCI \/ ASRU/i })).toBeInTheDocument();
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-recent")).toBeInTheDocument();
    expect(screen.getByTestId("mock-upcoming")).toBeInTheDocument();
    expect(screen.getByTestId("mock-drafts")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search patient/i })
    ).toBeInTheDocument();
  });
});
