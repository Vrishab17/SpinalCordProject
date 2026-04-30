import { expect, test } from "@playwright/test";

const SUPABASE_HOSTNAME =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "") ??
  "playwright.test.local";

const STAFF = {
  staff_id: 42,
  username: "jdoe",
  password: "secret123",
  prefix: "Dr",
  given_name: "Jane",
  family_name: "Doe",
};

/**
 * Stubs every fetch to *.supabase.co for one navigation, returning
 * canned data for the two queries the login flow performs.
 */
async function stubSupabase(
  page: import("@playwright/test").Page,
  options: { knownUser?: boolean } = {}
) {
  const knownUser = options.knownUser ?? true;

  await page.route(
    (url) => url.hostname.endsWith(SUPABASE_HOSTNAME),
    async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;

      if (path.includes("/Staff%20Credentials") || path.includes("/Staff Credentials")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            knownUser
              ? {
                  username: STAFF.username,
                  password_hash: STAFF.password,
                  STAFFstaff_id: STAFF.staff_id,
                }
              : null
          ),
        });
      }

      if (path.includes("/Staff%20Name") || path.includes("/Staff Name")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            prefix: STAFF.prefix,
            given_name: STAFF.given_name,
            preferred_name: null,
            family_name: STAFF.family_name,
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "null",
      });
    }
  );
}

test.describe("authentication smoke", () => {
  test("home redirects to /login and shows portal UI", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByRole("heading", { name: /Assessment Portal/i })
    ).toBeVisible();
    await expect(page.getByLabel(/staff username/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("invalid credentials show an inline error", async ({ page }) => {
    await stubSupabase(page, { knownUser: false });

    await page.goto("/login");
    await page.getByLabel(/staff username/i).fill("ghost");
    await page.getByLabel(/^password$/i).fill("nope");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
  });

  test("valid credentials route to dashboard and show staff name", async ({
    page,
  }) => {
    await stubSupabase(page);

    await page.goto("/login");
    await page.getByLabel(/staff username/i).fill(STAFF.username);
    await page.getByLabel(/^password$/i).fill(STAFF.password);
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /ISNCSCI \/ ASRU/i })
    ).toBeVisible();
    await expect(page.getByText(/Dr Jane Doe/)).toBeVisible();
  });
});
