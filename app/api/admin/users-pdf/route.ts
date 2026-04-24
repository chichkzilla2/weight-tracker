import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type UserRow = {
  realName: string;
  group: { name: string } | null;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function isThaiText(text: string) {
  return /[\u0E00-\u0E7F]/.test(text);
}

function getFontName(text: string, bold = false) {
  if (isThaiText(text)) return bold ? "SarabunBold" : "Sarabun";
  return bold ? "SarabunLatinBold" : "SarabunLatin";
}

function splitTextRuns(text: string) {
  const runs: string[] = [];

  for (const char of text) {
    const previous = runs[runs.length - 1];
    if (previous && isThaiText(previous) === isThaiText(char)) {
      runs[runs.length - 1] = previous + char;
    } else {
      runs.push(char);
    }
  }

  return runs;
}

function getMixedTextWidth(
  doc: PDFKit.PDFDocument,
  text: string,
  bold = false,
) {
  return splitTextRuns(text).reduce((width, run) => {
    doc.font(getFontName(run, bold));
    return width + doc.widthOfString(run);
  }, 0);
}

function drawMixedText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  options: PDFKit.Mixins.TextOptions = {},
  bold = false,
) {
  let currentX = x;

  for (const run of splitTextRuns(text)) {
    doc.font(getFontName(run, bold));
    doc.text(run, currentX, y, { ...options, continued: false });
    currentX += doc.widthOfString(run);
  }
}

function drawCenteredMixedText(
  doc: PDFKit.PDFDocument,
  text: string,
  y: number,
  bold = false,
) {
  const width = getMixedTextWidth(doc, text, bold);
  drawMixedText(doc, text, (doc.page.width - width) / 2, y, {}, bold);
}

function drawTableHeader(doc: PDFKit.PDFDocument, x: number, y: number) {
  doc.font("SarabunBold").fontSize(11);
  doc.text("ลำดับ", x, y, { width: 45 });
  doc.text("ชื่อจริง", x + 55, y, { width: 380 });
  doc
    .moveTo(x, y + 20)
    .lineTo(545, y + 20)
    .stroke("#D4C4A8");
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, needed = 48) {
  if (y + needed <= 760) return y;

  doc.addPage();
  return 50;
}

async function createPdf(users: UserRow[]) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const fontDir = path.join(process.cwd(), "public", "fonts");

  doc.registerFont(
    "Sarabun",
    path.join(fontDir, "sarabun-thai-400-normal.woff"),
  );
  doc.registerFont(
    "SarabunBold",
    path.join(fontDir, "sarabun-thai-700-normal.woff"),
  );
  doc.registerFont(
    "SarabunLatin",
    path.join(fontDir, "sarabun-latin-400-normal.woff"),
  );
  doc.registerFont(
    "SarabunLatinBold",
    path.join(fontDir, "sarabun-latin-700-normal.woff"),
  );
  doc.font("SarabunBold").fontSize(18);
  drawCenteredMixedText(doc, "รายชื่อสมาชิกทั้งหมด", doc.y, true);
  doc.moveDown(0.6);
  doc.fontSize(11);
  drawCenteredMixedText(doc, `วันที่ ${formatDate(new Date())}`, doc.y);
  doc.moveDown(1.5);

  const grouped = new Map<string, UserRow[]>();
  for (const user of users) {
    const groupName = user.group?.name ?? "ไม่มีกลุ่ม";
    grouped.set(groupName, [...(grouped.get(groupName) ?? []), user]);
  }

  let y = doc.y;

  for (const [groupName, groupUsers] of grouped) {
    let index = 1;

    y = ensureSpace(doc, y, 72);
    doc.fontSize(13);
    drawMixedText(doc, groupName, 50, y, {}, true);
    y += 24;

    drawTableHeader(doc, 50, y);
    y += 26;

    doc.font("Sarabun").fontSize(10);
    for (const user of groupUsers) {
      y = ensureSpace(doc, y, 34);
      if (y === 50) {
        drawTableHeader(doc, 50, y);
        y += 26;
        doc.font("Sarabun").fontSize(10);
      }

      doc.font("SarabunLatin").text(String(index), 50, y, { width: 45 });
      drawMixedText(doc, user.realName, 105, y, { width: 380 });
      doc
        .moveTo(50, y + 20)
        .lineTo(545, y + 20)
        .stroke("#EDE3D0");

      index += 1;
      y += 24;
    }

    y += 14;
  }

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: { group: true },
    orderBy: [{ group: { name: "asc" } }, { realName: "asc" }],
  });

  const pdf = await createPdf(users);
  const filename = `users-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
