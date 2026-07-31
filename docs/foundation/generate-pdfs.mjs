/**
 * Generate light-theme branded PDFs for Foundation documents.
 * Usage (from repo root): cd frontend && node ../docs/foundation/generate-pdfs.mjs
 */
import { createRequire } from "module";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, "..", "..", "frontend");
const { chromium } = require(path.join(frontendRoot, "node_modules", "@playwright/test"));
const outDir = path.join(__dirname, "pdf");

const documents = [
  { html: "business-plan.html", pdf: "NaijaJobber-Business-Plan.pdf" },
  { html: "financial-model.html", pdf: "NaijaJobber-Financial-Model.pdf" },
  {
    html: "grant-budget-narrative.html",
    pdf: "NaijaJobber-Grant-Budget-Narrative.pdf",
  },
  { html: "pitch-deck.html", pdf: "NaijaJobber-Pitch-Deck.pdf" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext();

for (const doc of documents) {
  const htmlPath = path.join(__dirname, doc.html);
  const pdfPath = path.join(outDir, doc.pdf);
  const page = await context.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, {
    waitUntil: "networkidle",
  });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  await page.close();
  console.log(`Created ${doc.pdf}`);
}

await browser.close();
console.log(`\nAll PDFs saved to ${outDir}`);
