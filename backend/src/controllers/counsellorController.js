const pool = require("../config/db");

async function listCounsellors(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, department FROM users WHERE role = 'counsellor'"
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function getAssignedStudents(req, res, next) {
  try {
    const counsellorId = req.user.role === "counsellor" ? req.user.id : req.params.counsellorId;

    const [rows] = await pool.query(
      `SELECT s.id, s.roll_no, s.name, s.academic_score, s.attendance_percentage,
              s.learning_ability, s.behaviour_score, b.name AS batch_name
       FROM students s
       INNER JOIN batches b ON s.current_batch_id = b.id
       WHERE b.counsellor_id = ?
       ORDER BY s.name`,
      [counsellorId]
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function addFeedback(req, res, next) {
  try {
    const counsellorId = req.user.id;
    const { student_id, feedback_text, progress_rating } = req.body;

    await pool.query(
      "INSERT INTO feedback (student_id, counsellor_id, feedback_text, progress_rating) VALUES (?, ?, ?, ?)",
      [student_id, counsellorId, feedback_text, progress_rating]
    );

    return res.status(201).json({ message: "Feedback added" });
  } catch (error) {
    return next(error);
  }
}

async function scheduleSession(req, res, next) {
  try {
    const { student_id, scheduled_at, agenda } = req.body;
    await pool.query(
      "INSERT INTO counselling_sessions (student_id, counsellor_id, scheduled_at, agenda) VALUES (?, ?, ?, ?)",
      [student_id, req.user.id, scheduled_at, agenda]
    );

    await pool.query(
      "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
      [student_id, "Counselling Session Scheduled", `Session scheduled on ${scheduled_at}`]
    );

    return res.status(201).json({ message: "Session scheduled" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listCounsellors,
  getAssignedStudents,
  addFeedback,
  scheduleSession,
};
