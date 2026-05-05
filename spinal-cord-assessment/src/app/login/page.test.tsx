import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const useRouterMock = useRouter as jest.Mock;
const fromMock = supabase.from as unknown as jest.Mock;

describe("LoginPage", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    pushMock.mockReset();
    useRouterMock.mockReturnValue({ push: pushMock });
    fromMock.mockReset();
    localStorage.clear();
  });

  it("renders login controls", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: /assessment portal/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("jdoe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows an error when username is not found", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Staff Credentials") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      };
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "ghost");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "nope");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid username or password")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows an error when password does not match", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Staff Credentials") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  username: "jdoe",
                  password_hash: "correct-password",
                  STAFFstaff_id: 7,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      };
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "jdoe");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "wrong");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid username or password")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows an error when supabase returns a query error", async () => {
    fromMock.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: null,
            error: { message: "connection refused" },
          }),
        }),
      }),
    }));

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "jdoe");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "abc");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText(/Invalid username or password\. Please try again\./i)
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows 'Logging in...' on the button while the request is in flight", async () => {
    let resolveCredentials!: (value: unknown) => void;
    fromMock.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () =>
            new Promise((resolve) => {
              resolveCredentials = resolve;
            }),
        }),
      }),
    }));

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "jdoe");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "pw");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(screen.getByRole("button", { name: /logging in/i })).toBeDisabled();
    resolveCredentials({ data: null, error: null });
  });

  it("typing in username or password clears the displayed error", async () => {
    fromMock.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
        }),
      }),
    }));

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "bad");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "bad");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));
    await screen.findByText("Invalid username or password");

    await userEvent.type(screen.getByPlaceholderText("jdoe"), "x");
    expect(screen.queryByText("Invalid username or password")).not.toBeInTheDocument();
  });

  it("falls back to given_name when preferred_name is null", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Staff Credentials") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { username: "jdoe", password_hash: "pw", STAFFstaff_id: 1 },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "Staff Name") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  prefix: "Dr",
                  given_name: "John",
                  preferred_name: null,
                  family_name: "Smith",
                },
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        }),
      };
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "jdoe");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "pw");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(JSON.parse(localStorage.getItem("staffInfo") ?? "{}").fullName).toBe("Dr John Smith");
  });

  it("stores staff info and routes to dashboard on valid login", async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === "Staff Credentials") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  username: "jdoe",
                  password_hash: "secret123",
                  STAFFstaff_id: 7,
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === "Staff Name") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  prefix: "Dr",
                  given_name: "Jane",
                  preferred_name: "Janey",
                  family_name: "Doe",
                },
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      };
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByPlaceholderText("jdoe"), "jdoe");
    await userEvent.type(document.querySelector('input[type="password"]') as Element, "secret123");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });

    const staffInfo = JSON.parse(localStorage.getItem("staffInfo") || "{}");
    expect(staffInfo).toEqual({
      username: "jdoe",
      fullName: "Dr Janey Doe",
    });
  });
});
