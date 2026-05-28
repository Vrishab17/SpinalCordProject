# SpinalCordProject Code Map

## Main Routes

- `src/app/page.tsx`: redirects the root route to `/login`.
- `src/app/login/page.tsx`: staff login screen. Posts credentials to `src/app/api/login/route.ts`, stores `staffInfo` in `sessionStorage`, then routes to `/dashboard`.
- `src/app/dashboard/page.tsx` and `src/app/dashboard/DashboardClient.tsx`: authenticated dashboard with recent assessments, upcoming reviews, clinician filter toggle, and patient search entry point.
- `src/app/search/page.tsx`: authenticated patient lookup page using `PatientSearch`.
- `src/app/patients/new/page.tsx`: new patient registration form.
- `src/app/patients/confirm/page.tsx` and `ConfirmPatientContent.tsx`: confirmation and consent page before inserting patient records.
- `src/app/assessment/page.tsx`: assessment route wrapper that renders the new/edit assessment client.
- `src/app/assessment/new/AssessmentNewClient.tsx`: authenticated assessment loader for either `?nhi=` or `?assessmentId=`.
- `src/app/history/[patientId]/page.tsx`: server-side patient detail/history loader.

## Key Folders And Files

- `src/components/assessment/`: ISNCSCI form, results panel, body diagram, patient assessment bar, and scoring constants.
- `src/components/layout/Header.tsx`: authenticated app header and profile/logout menu.
- `src/components/landing/`: dashboard widgets, tables, pagination, and dashboard buttons.
- `src/components/patients/`: patient search and new-patient form sections.
- `src/lib/supabaseClient.ts`: shared Supabase client.
- `src/lib/auth.ts` and `src/lib/staffSession.ts`: sessionStorage-based staff session helpers.
- `src/lib/assessmentExamData.ts`: load/save exam score rows for an assessment.
- `src/lib/persistAssessment.ts`: draft/final assessment persistence and classification result persistence.
- `src/lib/exportAssessmentPdf.ts`: PDF export onto `public/isncsci-template.pdf`.
- `public/diagram.svg`: official body diagram SVG used by `BodyDiagram`.
- `src/styles/globals.css` and `src/styles/dashboard.css`: global styling and dashboard utility classes.

## Assessment Page Structure

`AssessmentNewClient` wraps the assessment experience in `AuthGuard`, renders `Header`, renders `PatientAssessmentBar`, then renders `AssessmentForm` once patient/assessment context has loaded. It supports:

- `?nhi=...` for a new assessment attached to a patient.
- `?assessmentId=...` for loading an existing draft or finalised assessment.

`AssessmentForm` owns the page grid: right score column, `BodyDiagram`, left score column, non-key muscle selectors, comments/actions, and the `ResultsPanel` side panel.

## Assessment Component Connections

- `AssessmentNewClient` fetches patient bar details and loaded assessment context, then passes `patientId`, `patientNhi`, `initialAssessmentId`, `initialExam`, `initialComments`, and `readOnly` into `AssessmentForm`.
- `AssessmentForm` stores the current exam and comments in React state. It passes the exam to `BodyDiagram`, preview totals/classification state to `ResultsPanel`, and save/export handlers to the action buttons.
- `ResultsPanel` reads the current classification result and motor/sensory totals from props. Its Update button calls back to `AssessmentForm.updateClassification`.
- `PatientAssessmentBar` displays immutable patient/assessment metadata above the form.
- `BodyDiagram` receives the current exam and visually reflects LT/PP scoring.

## Patient Data Fetching

- Login uses `src/app/api/login/route.ts`.
- Dashboard widgets fetch assessments, patient rows, and patient names in `recentAssessments.tsx` and `upcoming.tsx`.
- Patient search fetches `Patient`, `Patient Name`, and `GP Enrollment` in `PatientSearch.tsx`.
- Patient confirmation inserts patient-related rows in `ConfirmPatientContent.tsx`.
- Assessment patient bar data is fetched in `AssessmentNewClient.loadPatientBar`.
- Existing assessment context and exam scores are fetched through `src/lib/assessmentExamData.ts`.
- Patient history fetches patient, name, address, assessments, staff names, exams, and AIS grades in `src/app/history/[patientId]/page.tsx`.

## Assessment State And Classification

- Current assessment UI state lives in `AssessmentForm` as `exam`, `result`, `comments`, `linkedAssessmentId`, `saving`, and `saveFeedback`.
- The ISNCSCI conversion is handled by `toISNCSCIExam` in `AssessmentForm`.
- Classification is calculated in `AssessmentForm` with the `isncsci` package via `new ISNCSCI(toISNCSCIExam(exam))`.
- `calculate`, `computeClassification`, and `tryComputeClassification` control when results are generated.

## Save Draft/Final Logic

- Draft and final button handlers live in `AssessmentForm`: `handleSaveDraft` and `handleSaveFinal`.
- Both call `persistAssessmentToDatabase` in `src/lib/persistAssessment.ts`.
- Final save requires a successful classification and persists AIS grade via `persistExamAndClassification`.
- Exam score row persistence is delegated to `persistExamData` in `src/lib/assessmentExamData.ts`.

## PDF Export

- The Export PDF button calls `AssessmentForm.handleExportPDF`.
- PDF generation lives in `src/lib/exportAssessmentPdf.ts`.
- It loads `public/isncsci-template.pdf`, writes patient, examiner, score, total, and classification fields with `pdf-lib`, then downloads the generated PDF.
- Do not change PDF coordinates or export logic unless explicitly required.

## Staff Login And Session

- `src/app/login/page.tsx` posts username/password to `/api/login`.
- On success it stores `{ username, fullName, staffId }` as `staffInfo` in `sessionStorage`.
- `src/lib/auth.ts` reads and clears `staffInfo`.
- `AuthGuard` protects authenticated client pages.
- `Header` displays the logged-in staff name and calls `logoutStaff` before returning to `/login`.
- `readStaffIdFromStorage` is used when saving assessments and filtering dashboard data.

## Body Diagram Contract

`BodyDiagram` must remain in the assessment page. It fetches `/diagram.svg`, injects the SVG markup, then finds SVG paths with `data-level` attributes such as `right-c5` or `left-s4-5`. For each dermatome level it overlays generated SVG paths coloured from light touch and pin prick scores.

Do not replace it with an image, remove it, or change its `data-level` colouring logic. Responsive work should only adjust the surrounding layout/container so the SVG remains visible and scrollable when necessary.

## Responsive Layout Strategy

- Preserve desktop inline styles and current desktop visual layout.
- Add semantic `className` hooks to major wrappers, cards, button rows, table scrollers, and form grids.
- Put responsive overrides in `src/styles/globals.css`.
- At `max-width: 900px`, let dashboard/history/assessment layouts stack and let dense tables or score grids scroll horizontally when needed.
- At `max-width: 600px`, use single-column form/card/action layouts and full-width buttons where appropriate.
- Keep the assessment score grid and body diagram non-overlapping; the results panel stacks below the form on smaller screens.

## Build And Deployment Notes

- Primary verification command: `npm run build`.
- The app is a Next.js app using App Router and client/server components.
- Supabase schema/seed material lives under `supabase/`.
- Static assets required at runtime are in `public/`, especially `diagram.svg` and `isncsci-template.pdf`.
- Environment configuration must provide the Supabase values expected by `src/lib/supabaseClient.ts`.
