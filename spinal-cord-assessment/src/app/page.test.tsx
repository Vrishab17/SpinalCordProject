import { redirect } from "next/navigation";
import Home from "./page";

const redirectMock = redirect as unknown as jest.Mock;

describe("Home", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    redirectMock.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    });
  });

  it("redirects to /login", () => {
    expect(() => {
      Home();
    }).toThrow(/NEXT_REDIRECT:\/login/);

    expect(redirectMock).toHaveBeenCalledWith("/login");
    expect(redirectMock).toHaveBeenCalledTimes(1);
  });
});
