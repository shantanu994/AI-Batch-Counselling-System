const pool = require("../config/db");

async function listStudents(req, res, next) {
  try {
    const { q = "", batchId, riskLevel } = req.query;
    const params = [`%${q}%`];

    let sql = `
      SELECT s.id, s.roll_no, s.name, s.email, s.academic_score, s.attendance_percentage,
             s.backlogs, s.interest_area, s.goal_type, s.learning_ability, s.behaviour_score,
             s.current_batch_id, b.name AS batch_name,
             ap.predicted_batch, ap.risk_level
      FROM students s
      LEFT JOIN batches b ON s.current_batch_id = b.id
      LEFT JOIN (
        SELECT x.student_id, x.predicted_batch, x.risk_level
        FROM ai_predictions x
        INNER JOIN (
          SELECT student_id, MAX(created_at) AS created_at
          FROM ai_predictions
          GROUP BY student_id
        ) latest ON latest.student_id = x.student_id AND latest.created_at = x.created_at
      ) ap ON ap.student_id = s.id
      WHERE (s.name LIKE ? OR s.roll_no LIKE ? OR s.email LIKE ?)
    `;

    params.push(`%${q}%`, `%${q}%`);

    if (batchId) {
      sql += " AND s.current_batch_id = ?";
      params.push(batchId);
    }

    if (riskLevel) {
      sql += " AND ap.risk_level = ?";
      params.push(riskLevel);
    }

    sql += " ORDER BY s.created_at DESC";

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT s.*, b.name AS batch_name,
              ap.predicted_batch, ap.risk_level, ap.recommendation, ap.score_breakdown
       FROM students s
       LEFT JOIN batches b ON s.current_batch_id = b.id
       LEFT JOIN ai_predictions ap ON ap.id = (
          SELECT x.id FROM ai_predictions x
          WHERE x.student_id = s.id
          ORDER BY x.created_at DESC LIMIT 1
       )
       WHERE s.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [feedback] = await pool.query(
      `SELECT f.id, f.feedback_text, f.progress_rating, f.created_at, u.name AS counsellor_name
       FROM feedback f
       LEFT JOIN users u ON f.counsellor_id = u.id
       WHERE f.student_id = ?
       ORDER BY f.created_at DESC`,
      [id]
    );

    const student = rows[0];
    if (student.score_breakdown && typeof student.score_breakdown === "string") {
      try {
        student.score_breakdown = JSON.parse(student.score_breakdown);
      } catch (error) {
        student.score_breakdown = null;
      }
    }

    return res.json({ ...student, feedback });
  } catch (error) {
    return next(error);
  }
}

async function createStudent(req, res, next) {
  try {
    const {
      roll_no,
      name,
      email,
      academic_score,
      attendance_percentage,
      backlogs,
      interest_area,
      goal_type,
      learning_ability,
      behaviour_score,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO students
      (roll_no, name, email, academic_score, attendance_percentage, backlogs, interest_area, goal_type, learning_ability, behaviour_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roll_no,
        name,
        email,
        academic_score,
        attendance_percentage,
        backlogs,
        interest_area,
        goal_type,
        learning_ability,
        behaviour_score,
      ]
    );

    return res.status(201).json({ id: result.insertId, message: "Student created" });
  } catch (error) {
    return next(error);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const fields = [
      "roll_no",
      "name",
      "email",
      "academic_score",
      "attendance_percentage",
      "backlogs",
      "interest_area",
      "goal_type",
      "learning_ability",
      "behaviour_score",
      "current_batch_id",
    ];

    const updates = [];
    const params = [];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    params.push(id);
    await pool.query(`UPDATE students SET ${updates.join(", ")} WHERE id = ?`, params);

    return res.json({ message: "Student updated" });
  } catch (error) {
    return next(error);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM students WHERE id = ?", [id]);
    return res.json({ message: "Student deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
