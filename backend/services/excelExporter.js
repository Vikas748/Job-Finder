// services/excelExporter.js
// Builds a formatted Excel workbook of a user's matching jobs (using exceljs).
// Sheet 1: Matching Jobs   Sheet 2: the user's preferences (so the file explains itself)

const ExcelJS = require("exceljs");

const HEADER_COLOR = "FF14424A"; // dark teal
const STRIPE_COLOR = "FFF1F6F6"; // very light teal
const BORDER = { style: "thin", color: { argb: "FFD5DEDF" } };

function createWorkbook(user, matches) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Matching Jobs", {
    views: [{ state: "frozen", ySplit: 1 }], // header stays visible while scrolling
  });

  sheet.columns = [
    { header: "Company",         key: "company",       width: 18 },
    { header: "Job Title",       key: "title",         width: 30 },
    { header: "Location",        key: "location",      width: 20 },
    { header: "Remote / On-site", key: "workType",     width: 16 },
    { header: "Posted Date",     key: "postedDate",    width: 13 },
    { header: "Match Score",     key: "matchScore",    width: 12 },
    { header: "Matched Skills",  key: "matchedSkills", width: 28 },
    { header: "Skills to Learn", key: "missingSkills", width: 28 },
    { header: "Why It Matched",  key: "matchReason",   width: 48 },
    { header: "Job URL",         key: "jobUrl",        width: 42 },
  ];

  // ── Header style ──────────────────────────────────────────────────
  const header = sheet.getRow(1);
  header.height = 26;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_COLOR } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // ── Data rows ─────────────────────────────────────────────────────
  matches.forEach((job, index) => {
    const row = sheet.addRow({
      company:       job.company,
      title:         job.title,
      location:      job.location,
      workType:      job.workType,
      postedDate:    job.postedDate,
      matchScore:    job.matchScore / 100, // shown as a percentage
      matchedSkills: (job.matchedSkills || []).join(", "),
      missingSkills: (job.missingSkills || []).join(", "),
      matchReason:   job.matchReason,
      jobUrl:        { text: job.jobUrl, hyperlink: job.jobUrl },
    });

    row.eachCell((cell) => {
      cell.alignment = { vertical: "top", wrapText: true };
      cell.border = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };
      if (index % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: STRIPE_COLOR } };
      }
    });

    row.getCell("matchScore").numFmt = "0%";
    row.getCell("jobUrl").font = { color: { argb: "FF0563C1" }, underline: true };
  });

  // Filter dropdowns on every column
  sheet.autoFilter = { from: "A1", to: "J1" };

  // ── Preferences sheet ─────────────────────────────────────────────
  const prefs = workbook.addWorksheet("Preferences");
  prefs.columns = [
    { header: "Field", key: "field", width: 22 },
    { header: "Value", key: "value", width: 60 },
  ];
  prefs.getRow(1).font = { bold: true };
  prefs.addRows([
    { field: "Name",                value: user.name },
    { field: "WhatsApp number",     value: user.phoneNumber },
    { field: "Job titles",          value: user.jobTitles.join(", ") || "Any" },
    { field: "Locations",           value: user.locations.join(", ") || "Any" },
    { field: "Work types",          value: user.workTypes.join(", ") || "Any" },
    { field: "Skills",              value: user.skills.join(", ") || "—" },
    { field: "Preferred companies", value: user.preferredCompanies.join(", ") || "—" },
    { field: "Matching jobs",       value: matches.length },
    { field: "Exported at",         value: new Date().toLocaleString("en-IN") },
  ]);

  return workbook;
}

module.exports = { createWorkbook };
