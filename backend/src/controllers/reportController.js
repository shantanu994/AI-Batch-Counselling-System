const pool = require("../config/db");
const { buildStudentExcel, buildStudentPdf } = require("../services/reportService");

async function exportStudentPdf(req, res, next) {
  try {
    const { studentId } = req.params;
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.email, s.attendance_percentage, s.academic_score,
              b.name AS batch_name,
              ap.risk_level,
              ap.recommendation AS improvement_plan
       FROM students s
       LEFT JOIN batches b ON s.current_batch_id = b.id
       LEFT JOIN ai_predictions ap ON ap.id = (
          SELECT x.id FROM ai_predictions x
          WHERE x.student_id = s.id
          ORDER BY x.created_at DESC LIMIT 1
       )
       WHERE s.id = ?`,
      [studentId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const pdfBuffer = await buildStudentPdf(rows[0]);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=student-${studentId}-report.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
}

async function exportStudentsExcel(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.name, s.attendance_percentage, s.academic_score,
              b.name AS batch_name,
              ap.risk_level
       FROM students s
       LEFT JOIN batches b ON s.current_batch_id = b.id
       LEFT JOIN ai_predictions ap ON ap.id = (
          SELECT x.id FROM ai_predictions x
          WHERE x.student_id = s.id
          ORDER BY x.created_at DESC LIMIT 1
       )
       ORDER BY s.name`
    );

    const buffer = await buildStudentExcel(rows);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students-report.xlsx");
    return res.send(Buffer.from(buffer));
  } catch (error) {
    return next(error);
  }
}

module.exports = { exportStudentPdf, exportStudentsExcel };
