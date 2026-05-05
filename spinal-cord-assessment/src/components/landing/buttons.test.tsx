import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Buttons from "./buttons";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const useRouterMock = useRouter as jest.Mock;

describe("Landing buttons", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    pushMock.mockReset();
    useRouterMock.mockReturnValue({ push: pushMock });
  });

  it("routes to patient search from search button", async () => {
    render(<Buttons />);

    await userEvent.click(screen.getByRole("button", { name: /search patient/i }));

    expect(pushMock).toHaveBeenCalledWith("/search");
  });

  it("routes to new patient page from new patient button", async () => {
    render(<Buttons />);

    await userEvent.click(screen.getByRole("button", { name: /\+ new patient/i }));

    expect(pushMock).toHaveBeenCalledWith("/patients/new");
  });
});
