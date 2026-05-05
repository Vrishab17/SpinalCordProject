/**
 * @jest-environment node
 */
import { GET } from "./route";
import { supabase } from "@/lib/supabaseClient";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const fromMock = supabase.from as unknown as jest.Mock;

describe("GET /api/test", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("returns count when Supabase query succeeds", async () => {
    const selectMock = jest.fn().mockResolvedValue({
      error: null,
      count: 7,
    });

    fromMock.mockReturnValue({
      select: selectMock,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, table: "Patient", count: 7 });
    expect(fromMock).toHaveBeenCalledWith("Patient");
    expect(selectMock).toHaveBeenCalledWith("*", { count: "exact", head: true });
  });

  it("returns 500 with error details when Supabase query fails", async () => {
    const selectMock = jest.fn().mockResolvedValue({
      error: { message: "RLS denied" },
      count: null,
    });

    fromMock.mockReturnValue({
      select: selectMock,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.where).toBe("supabase");
    expect(body.message).toBe("RLS denied");
    expect(body.hint).toMatch(/RLS\/permission error/);
  });
});
