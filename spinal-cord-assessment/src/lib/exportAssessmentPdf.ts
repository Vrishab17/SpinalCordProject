import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { getLoggedInStaff } from "./auth";

const LEVELS = [
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
  "S2",
  "S3",
  "S4_5",
];

const MOTOR_LEVELS = [
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
];

const SHOW_DEBUG_GRID = false;

function value(v: any) {
  return v === undefined || v === null || v === "" ? "" : String(v);
}

function get(obj: any, paths: string[]) {
  for (const path of paths) {
    const v = path.split(".").reduce((acc, key) => acc?.[key], obj);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return "";
}

function downloadPdf(bytes: Uint8Array, filename: string) {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  const uint8Array = new Uint8Array(arrayBuffer);
  uint8Array.set(bytes);

  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function drawDebugGrid(page: any) {
  const { width, height } = page.getSize();

  for (let x = 0; x <= width; x += 25) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: 0.3,
      color: rgb(1, 0, 0),
    });

    page.drawText(String(x), {
      x: x + 2,
      y: height - 12,
      size: 6,
      color: rgb(1, 0, 0),
    });
  }

  for (let y = 0; y <= height; y += 25) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      thickness: 0.3,
      color: rgb(0, 0, 1),
    });

    page.drawText(String(y), {
      x: 2,
      y: y + 2,
      size: 6,
      color: rgb(0, 0, 1),
    });
  }
}

export async function exportAssessmentPdf({
  patient,
  exam,
  result,
  nhi,
}: {
  patient: any;
  exam: any;
  result: any;
  nhi: string | null;
}) {
  const templateBytes = await fetch("/isncsci-template.pdf").then((res) =>
    res.arrayBuffer()
  );
  const staff = getLoggedInStaff();
  const examinerName = staff?.fullName ?? "";

  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  if (SHOW_DEBUG_GRID) {
    drawDebugGrid(page);
  }

  const navy = rgb(0.05, 0.12, 0.25);

  function text(
    input: any,
    x: number,
    y: number,
    size = 8,
    isBold = true,
    center = false,
    rotate = 0
  ) {
    const str = value(input);
    if (!str) return;

    const selectedFont = isBold ? bold : font;
    const width = selectedFont.widthOfTextAtSize(str, size);

    page.drawText(str, {
      x: center ? x - width / 2 : x,
      y,
      size,
      font: selectedFont,
      color: navy,
      rotate: degrees(rotate),
    });
  }

  const patientName = patient
    ? `${patient.name?.family_name ?? ""}, ${
        patient.name?.given_name ?? ""
      }`.trim()
    : "";

  const c = result?.classification ?? {};
  const t = result?.totals ?? {};
  const examDate = new Date().toLocaleDateString("en-NZ");

  // Header fields
  text(patientName, 442, 585, 8, true, false);
  text(examDate, 660, 585, 8, true, false);
  text(examinerName, 450, 565, 8, true, false);

  // Main score grid
  const startY = 500;
  const rowGap = 13;

  const rightMotorX = 199;
  const rightLTX = 235;
  const rightPPX = 281;

  const leftLTX = 499;
  const leftPPX = 546;
  const leftMotorX = 586;

  LEVELS.forEach((level, index) => {
    const y = startY - index * rowGap;

    if (MOTOR_LEVELS.includes(level)) {
      text(exam.right.motor[level], rightMotorX, y, 7);
      text(exam.left.motor[level], leftMotorX, y, 7);
    }

    text(exam.right.lightTouch[level], rightLTX, y, 7);
    text(exam.right.pinPrick[level], rightPPX, y, 7);

    text(exam.left.lightTouch[level], leftLTX, y, 7);
    text(exam.left.pinPrick[level], leftPPX, y, 7);
  });

  // VAC / DAP
  text(exam.voluntaryAnalContraction, 149, 152, 8);
  text(exam.deepAnalPressure, 639, 152, 8);

  // Totals under main score columns
  text(t?.right?.motor, rightMotorX, 134, 8);
  text(t?.right?.lightTouch, rightLTX, 134, 8);
  text(t?.right?.pinPrick, rightPPX, 134, 8);

  text(t?.left?.lightTouch, leftLTX, 134, 8);
  text(t?.left?.pinPrick, leftPPX, 134, 8);
  text(t?.left?.motor, leftMotorX, 134, 8);

  // Motor subscores
  text(t?.right?.upperExtremity, 49, 92, 8);
  text(t?.left?.upperExtremity, 100, 92, 8);
  text(t?.upperExtremity, 183, 92, 8);

  text(t?.right?.lowerExtremity, 242, 92, 8);
  text(t?.left?.lowerExtremity, 293, 92, 8);
  text(t?.lowerExtremity, 382, 92, 8);

  // Sensory subscores
  text(t?.right?.lightTouch, 446, 92, 8);
  text(t?.left?.lightTouch, 500, 92, 8);
  text(t?.lightTouch, 570, 92, 8);

  text(t?.right?.pinPrick, 624, 92, 8);
  text(t?.left?.pinPrick, 682, 92, 8);
  text(t?.pinPrick, 755, 92, 8);

  // Classification section
  text(
    get(c, [
      "neurologicalLevel.sensoryRight",
      "neurologicalLevels.sensoryRight",
    ]),
    172,
    50,
    7
  );

  text(
    get(c, ["neurologicalLevel.sensoryLeft", "neurologicalLevels.sensoryLeft"]),
    199,
    50,
    7
  );

  text(
    get(c, ["neurologicalLevel.motorRight", "neurologicalLevels.motorRight"]),
    172,
    37,
    7
  );

  text(
    get(c, ["neurologicalLevel.motorLeft", "neurologicalLevels.motorLeft"]),
    199,
    37,
    7
  );

  text(get(c, ["neurologicalLevelOfInjury"]), 330, 46, 8);

  text(get(c, ["completeOrIncomplete", "injuryComplete"]), 528, 55, 8);

  text(get(c, ["ASIAImpairmentScale", "asiaImpairmentScale"]), 528, 37, 8);

  // Zone of partial preservation
  text(
    get(c, [
      "zoneOfPartialPreservations.sensoryRight",
      "zoneOfPartialPreservation.sensoryRight",
    ]),
    723,
    50,
    7
  );

  text(
    get(c, [
      "zoneOfPartialPreservations.sensoryLeft",
      "zoneOfPartialPreservation.sensoryLeft",
    ]),
    750,
    50,
    7
  );

  text(
    get(c, [
      "zoneOfPartialPreservations.motorRight",
      "zoneOfPartialPreservation.motorRight",
    ]),
    723,
    37,
    7
  );

  text(
    get(c, [
      "zoneOfPartialPreservations.motorLeft",
      "zoneOfPartialPreservation.motorLeft",
    ]),
    750,
    37,
    7
  );

  const bytes = await pdfDoc.save();

  downloadPdf(
    bytes,
    `ISNCSCI_Assessment_${nhi ?? patient?.nhi_number ?? "patient"}.pdf`
  );
}
