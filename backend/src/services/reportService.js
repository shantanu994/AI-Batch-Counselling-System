const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

async function buildStudentExcel(studentRows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = [
    { header: "Student ID", key: "id", width: 12 },
    { header: "Name", key: "name", width: 24 },
    { header: "Attendance", key: "attendance_percentage", width: 14 },
    { header: "Academic Score", key: "academic_score", width: 14 },
    { header: "Batch", key: "batch_name", width: 24 },
    { header: "Risk Level", key: "risk_level", width: 14 },
  ];

  studentRows.forEach((row) => sheet.addRow(row));
  return workbook.xlsx.writeBuffer();
}

function buildStudentPdf(student) {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(18).text("Student Performance Report", { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Name: ${student.name}`);
  doc.text(`Email: ${student.email}`);
  doc.text(`Attendance: ${student.attendance_percentage}%`);
  doc.text(`Academic Score: ${student.academic_score}`);
  doc.text(`Current Batch: ${student.batch_name || "Unassigned"}`);
  doc.text(`AI Risk Level: ${student.risk_level || "N/A"}`);
  doc.moveDown();
  doc.text("Recommended Plan:");
  doc.text(student.improvement_plan || "No recommendation available.");
  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

module.exports = { buildStudentExcel, buildStudentPdf };
