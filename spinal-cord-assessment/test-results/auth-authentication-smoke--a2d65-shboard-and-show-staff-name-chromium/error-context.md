# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> authentication smoke >> valid credentials route to dashboard and show staff name
- Location: e2e/auth.spec.ts:94:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard$/
Received string:  "http://127.0.0.1:3000/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://127.0.0.1:3000/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]: Health New Zealand
        - generic [ref=e6]: Te Whatu Ora
      - heading "ISNCSCI / ASRU Assessment Portal" [level=1] [ref=e7]:
        - text: ISNCSCI / ASRU
        - text: Assessment Portal
    - generic [ref=e9]:
      - generic [ref=e10]:
        - text: STAFF USERNAME
        - textbox "STAFF USERNAME" [ref=e11]:
          - /placeholder: jdoe
          - text: jdoe
      - generic [ref=e12]:
        - text: PASSWORD
        - textbox "PASSWORD" [ref=e13]: secret123
      - button "Logging in..." [disabled] [ref=e14] [cursor=pointer]
  - alert [ref=e15]
```

# Test source

```ts
  4   |   process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "") ??
  5   |   "playwright.test.local";
  6   | 
  7   | const STAFF = {
  8   |   staff_id: 42,
  9   |   username: "jdoe",
  10  |   password: "secret123",
  11  |   prefix: "Dr",
  12  |   given_name: "Jane",
  13  |   family_name: "Doe",
  14  | };
  15  | 
  16  | /**
  17  |  * Stubs every fetch to *.supabase.co for one navigation, returning
  18  |  * canned data for the two queries the login flow performs.
  19  |  */
  20  | async function stubSupabase(
  21  |   page: import("@playwright/test").Page,
  22  |   options: { knownUser?: boolean } = {}
  23  | ) {
  24  |   const knownUser = options.knownUser ?? true;
  25  | 
  26  |   await page.route(
  27  |     (url) => url.hostname.endsWith(SUPABASE_HOSTNAME),
  28  |     async (route) => {
  29  |       const url = new URL(route.request().url());
  30  |       const path = url.pathname;
  31  | 
  32  |       if (path.includes("/Staff%20Credentials") || path.includes("/Staff Credentials")) {
  33  |         return route.fulfill({
  34  |           status: 200,
  35  |           contentType: "application/json",
  36  |           body: JSON.stringify(
  37  |             knownUser
  38  |               ? {
  39  |                   username: STAFF.username,
  40  |                   password_hash: STAFF.password,
  41  |                   STAFFstaff_id: STAFF.staff_id,
  42  |                 }
  43  |               : null
  44  |           ),
  45  |         });
  46  |       }
  47  | 
  48  |       if (path.includes("/Staff%20Name") || path.includes("/Staff Name")) {
  49  |         return route.fulfill({
  50  |           status: 200,
  51  |           contentType: "application/json",
  52  |           body: JSON.stringify({
  53  |             prefix: STAFF.prefix,
  54  |             given_name: STAFF.given_name,
  55  |             preferred_name: null,
  56  |             family_name: STAFF.family_name,
  57  |           }),
  58  |         });
  59  |       }
  60  | 
  61  |       return route.fulfill({
  62  |         status: 200,
  63  |         contentType: "application/json",
  64  |         body: "null",
  65  |       });
  66  |     }
  67  |   );
  68  | }
  69  | 
  70  | test.describe("authentication smoke", () => {
  71  |   test("home redirects to /login and shows portal UI", async ({ page }) => {
  72  |     await page.goto("/");
  73  |     await expect(page).toHaveURL(/\/login$/);
  74  | 
  75  |     await expect(
  76  |       page.getByRole("heading", { name: /Assessment Portal/i })
  77  |     ).toBeVisible();
  78  |     await expect(page.getByLabel(/staff username/i)).toBeVisible();
  79  |     await expect(page.getByLabel(/^password$/i)).toBeVisible();
  80  |     await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
  81  |   });
  82  | 
  83  |   test("invalid credentials show an inline error", async ({ page }) => {
  84  |     await stubSupabase(page, { knownUser: false });
  85  | 
  86  |     await page.goto("/login");
  87  |     await page.getByLabel(/staff username/i).fill("ghost");
  88  |     await page.getByLabel(/^password$/i).fill("nope");
  89  |     await page.getByRole("button", { name: /log in/i }).click();
  90  | 
  91  |     await expect(page.getByText(/Invalid username or password/i)).toBeVisible();
  92  |   });
  93  | 
  94  |   test("valid credentials route to dashboard and show staff name", async ({
  95  |     page,
  96  |   }) => {
  97  |     await stubSupabase(page);
  98  | 
  99  |     await page.goto("/login");
  100 |     await page.getByLabel(/staff username/i).fill(STAFF.username);
  101 |     await page.getByLabel(/^password$/i).fill(STAFF.password);
  102 |     await page.getByRole("button", { name: /log in/i }).click();
  103 | 
> 104 |     await expect(page).toHaveURL(/\/dashboard$/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  105 |     await expect(
  106 |       page.getByRole("heading", { name: /ISNCSCI \/ ASRU/i })
  107 |     ).toBeVisible();
  108 |     await expect(page.getByText(/Dr Jane Doe/)).toBeVisible();
  109 |   });
  110 | });
  111 | 
```