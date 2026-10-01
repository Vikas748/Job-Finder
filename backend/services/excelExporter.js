// services/excelExporter.js
// Generates a formatted Excel (.xlsx) file of matching jobs using exceljs.

const ExcelJS = require("exceljs");
const path    = require("path");
const fs      = require("fs");

class ExcelExporter {
  constructor() {
    // Make sure the exports directory exists
    this.exportDir = path.join(__dirname, "..", "data", "exports");
    fs.mkdirSync(this.exportDir, { recursive: true });
  }

  // Builds and saves the Excel file.
  // @param {Array} matchedJobs  Array of plain job objects (with matchReason field)
  // @returns {string}           Absolute path to the saved .xlsx file
  async export(matchedJobs) {
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Matching Jobs");

    // ── Define columns ────────────────────────────────────────────────
    worksheet.columns = [
      { header: "Company",      key: "company",     width: 20 },
      { header: "Job Title",    key: "title",       width: 30 },
      { header: "Location",     key: "location",    width: 20 },
      { header: "Work Type",    key: "workType",    width: 12 },
      { header: "Posted Date",  key: "postedDate",  width: 14 },
      { header: "Job URL",      key: "jobUrl",      width: 45 },
      { header: "Why Matched",  key: "matchReason", width: 50 },
    ];

    // ── Style the header row ──────────────────────────────────────────
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font         = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill         = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
      cell.alignment    = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border       = {
        top:    { style: "thin", color: { argb: "FFB0C4DE" } },
        left:   { style: "thin", color: { argb: "FFB0C4DE" } },
        bottom: { style: "thin", color: { argb: "FFB0C4DE" } },
        right:  { style: "thin", color: { argb: "FFB0C4DE" } },
      };
    });
    headerRow.height = 28;

    // ── Add data rows ─────────────────────────────────────────────────
    matchedJobs.forEach((job, index) => {
      const row = worksheet.addRow({
        company:     job.company     || "",
        title:       job.title       || "",
        location:    job.location    || "",
        workType:    job.workType    || "",
        postedDate:  job.postedDate  || "",
        jobUrl:      job.jobUrl      || "",
        matchReason: job.matchReason || "",
      });

      // Alternating row background
      const bgColor = index % 2 === 0 ? "FFEBF2FF" : "FFFFFFFF";

      row.eachCell((cell) => {
        cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
        cell.alignment = { vertical: "top", wrapText: true };
        cell.border    = {
          top:    { style: "thin", color: { argb: "FFB0C4DE" } },
          left:   { style: "thin", color: { argb: "FFB0C4DE" } },
          bottom: { style: "thin", color: { argb: "FFB0C4DE" } },
          right:  { style: "thin", color: { argb: "FFB0C4DE" } },
        };
      });

      // Make the Job URL column a hyperlink
      const urlCell = row.getCell("jobUrl");
      if (job.jobUrl && job.jobUrl.startsWith("http")) {
        urlCell.value = { text: job.jobUrl, hyperlink: job.jobUrl };
        urlCell.font  = { color: { argb: "FF0563C1" }, underline: true };
      }

      row.height = 40;
    });

    // ── Save file ─────────────────────────────────────────────────────
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const fileName  = `matching_jobs_${timestamp}.xlsx`;
    const filePath  = path.join(this.exportDir, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log(`📊  Excel exported → ${filePath}`);
    return filePath;
  }
}

module.exports = ExcelExporter;
