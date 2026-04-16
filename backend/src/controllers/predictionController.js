const pool = require("../config/db");
const { generatePredictionForStudent } = require("../services/predictionEngineService");

async function predictForStudent(req, res, next) {
  try {
    const { studentId } = req.params;
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [studentId]);

    if (!rows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    const student = rows[0];
    const aiResponse = await generatePredictionForStudent(student);

    await pool.query(
      `INSERT INTO ai_predictions
      (student_id, predicted_batch, risk_level, recommendation, score_breakdown)
      VALUES (?, ?, ?, ?, ?)`,
      [
        student.id,
        aiResponse.predicted_batch,
        aiResponse.risk_level,
        aiResponse.recommendation,
        JSON.stringify(aiResponse.score_breakdown || {}),
      ]
    );

    return res.json(aiResponse);
  } catch (error) {
    return next(error);
  }
}

async function bulkPredict(req, res, next) {
  try {
    const [students] = await pool.query("SELECT * FROM students");
    const results = [];

    for (const student of students) {
      const aiResponse = await generatePredictionForStudent(student);

      await pool.query(
        `INSERT INTO ai_predictions
        (student_id, predicted_batch, risk_level, recommendation, score_breakdown)
        VALUES (?, ?, ?, ?, ?)`,
        [
          student.id,
          aiResponse.predicted_batch,
          aiResponse.risk_level,
          aiResponse.recommendation,
          JSON.stringify(aiResponse.score_breakdown || {}),
        ]
      );

      results.push({ student_id: student.id, ...aiResponse });
    }

    return res.json({ count: results.length, results });
  } catch (error) {
    return next(error);
  }
}

module.exports = { predictForStudent, bulkPredict };
