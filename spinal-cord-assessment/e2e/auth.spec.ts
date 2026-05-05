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
  options: {
    knownUser?: boolean;
    patientSearchFound?: boolean;
  } = {}
) {
  const knownUser = options.knownUser ?? true;
  const patientSearchFound = options.patientSearchFound ?? false;

  await page.route(
    (url) =>
      url.hostname.endsWith(SUPABASE_HOSTNAME) ||
      url.hostname.includes("supabase.co"),
    async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const decodedPath = decodeURIComponent(path);

      if (decodedPath.includes("/Staff Credentials")) {
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

      if (decodedPath.includes("/Staff Name")) {
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

      if (decodedPath.includes("/Draft Assessment")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }

      if (decodedPath.includes("/Assessment")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }

      if (decodedPath.includes("/Patient Name")) {
        if (patientSearchFound) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              {
                PATIENTpatient_id: 501,
                given_name: "Test",
                family_name: "Patient",
              },
            ]),
          });
        }

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }

      if (decodedPath.includes("/GP Enrollment")) {
        if (patientSearchFound) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([{ hpi_practitioner_id: "HPI-1234" }]),
          });
        }

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }

      if (decodedPath.includes("/Patient")) {
        if (patientSearchFound) {
          return route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([
              {
                patient_id: 501,
                nhi_number: "AAA1111",
                date_of_birth: "1990-10-03",
                gender: "F",
              },
            ]),
          });
        }

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
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
    await expect(page.getByPlaceholder("jdoe")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  });

  test("invalid credentials show an inline error", async ({ page }) => {
    await stubSupabase(page, { knownUser: false });

    await page.goto("/login");
    await page.getByPlaceholder("jdoe").fill("ghost");
    await page.locator('input[type="password"]').fill("nope");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
  });

  test("valid credentials route to dashboard and show staff name", async ({
    page,
  }) => {
    await stubSupabase(page);

    await page.goto("/login");
    await page.getByPlaceholder("jdoe").fill(STAFF.username);
    await page.locator('input[type="password"]').fill(STAFF.password);
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /ISNCSCI \/ ASRU/i })
    ).toBeVisible();
    await expect(page.getByText(/Dr Jane Doe/)).toBeVisible();
  });

  test("dashboard action buttons navigate to search and new patient pages", async ({
    page,
  }) => {
    await stubSupabase(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "staffInfo",
        JSON.stringify({ username: "jdoe", fullName: "Dr Jane Doe" })
      );
    });

    await page.goto("/dashboard");
    await page.getByRole("button", { name: /search patient/i }).click();
    await expect(page).toHaveURL(/\/search$/);

    await page.goto("/dashboard");
    await page.getByRole("button", { name: /\+ new patient/i }).click();
    await expect(page).toHaveURL(/\/patients\/new$/);
  });

  test("patient search page validates empty search submission", async ({ page }) => {
    await stubSupabase(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "staffInfo",
        JSON.stringify({ username: "jdoe", fullName: "Dr Jane Doe" })
      );
    });

    await page.goto("/search");
    await page.getByRole("button", { name: /search nhi fhir/i }).click();
    await expect(page.getByText(/Enter NHI OR Last Name \+ DOB/i)).toBeVisible();
  });

  test("patient search can find a patient by NHI", async ({ page }) => {
    await stubSupabase(page, { patientSearchFound: true });
    await page.addInitScript(() => {
      localStorage.setItem(
        "staffInfo",
        JSON.stringify({ username: "jdoe", fullName: "Dr Jane Doe" })
      );
    });

    await page.goto("/search");
    await page.getByPlaceholder("e.g. ABC1234").fill("AAA1111");
    await page.getByRole("button", { name: /search nhi fhir/i }).click();

    await expect(page.getByText(/Patient Found/i)).toBeVisible();
    await expect(page.getByText(/Test\s+Patient/i)).toBeVisible();
    await expect(page.getByText(/AAA1111/i)).toBeVisible();
  });

  test("new patient page can navigate back to dashboard", async ({ page }) => {
    await stubSupabase(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "staffInfo",
        JSON.stringify({ username: "jdoe", fullName: "Dr Jane Doe" })
      );
    });

    await page.goto("/patients/new");
    await page.getByRole("button", { name: /back to home/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("new patient form shows required fields message on review", async ({ page }) => {
    await stubSupabase(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "staffInfo",
        JSON.stringify({ username: "jdoe", fullName: "Dr Jane Doe" })
      );
    });

    await page.goto("/patients/new");
    await page.getByRole("button", { name: /review & confirm/i }).click();

    const validationError = page.getByText(/^Please complete:/i);
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText("NHI Number");
  });
});
