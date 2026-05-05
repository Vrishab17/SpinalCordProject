import { render, screen, waitFor } from "@testing-library/react";
import Header from "./Header";

describe("Header", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows unknown user when no staff info exists", async () => {
    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText("Unknown User")).toBeInTheDocument();
    });
  });

  it("shows full name from local storage", async () => {
    localStorage.setItem(
      "staffInfo",
      JSON.stringify({
        username: "jdoe",
        fullName: "Dr Jane Doe",
      })
    );

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText("Dr Jane Doe")).toBeInTheDocument();
    });
  });

  it("falls back to unknown user when storage value is invalid", async () => {
    localStorage.setItem("staffInfo", "{bad json");

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText("Unknown User")).toBeInTheDocument();
    });
  });
});
