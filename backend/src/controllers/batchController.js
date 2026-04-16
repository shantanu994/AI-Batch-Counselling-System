const pool = require("../config/db");
const { generatePredictionForStudent } = require("../services/predictionEngineService");

async function listBatches(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.name, b.type, b.capacity, b.counsellor_id, u.name AS counsellor_name,
              COUNT(s.id) AS student_count
       FROM batches b
       LEFT JOIN users u ON b.counsellor_id = u.id
       LEFT JOIN students s ON s.current_batch_id = b.id
       GROUP BY b.id
       ORDER BY b.created_at DESC`
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function createBatch(req, res, next) {
  try {
    const { name, type, capacity, counsellor_id } = req.body;
    const [result] = await pool.query(
      "INSERT INTO batches (name, type, capacity, counsellor_id) VALUES (?, ?, ?, ?)",
      [name, type, capacity, counsellor_id || null]
    );
    return res.status(201).json({ id: result.insertId, message: "Batch created" });
  } catch (error) {
    return next(error);
  }
}

async function updateBatch(req, res, next) {
  try {
    const { id } = req.params;
    const { name, type, capacity, counsellor_id } = req.body;

    await pool.query(
      "UPDATE batches SET name = ?, type = ?, capacity = ?, counsellor_id = ? WHERE id = ?",
      [name, type, capacity, counsellor_id || null, id]
    );

    return res.json({ message: "Batch updated" });
  } catch (error) {
    return next(error);
  }
}

async function deleteBatch(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query("UPDATE students SET current_batch_id = NULL WHERE current_batch_id = ?", [id]);
    await pool.query("DELETE FROM batches WHERE id = ?", [id]);
    return res.json({ message: "Batch deleted" });
  } catch (error) {
    return next(error);
  }
}

async function autoAssignStudents(req, res, next) {
  try {
    const [students] = await pool.query("SELECT * FROM students");

    const [batches] = await pool.query("SELECT id, type FROM batches");
    const batchByType = batches.reduce((acc, b) => {
      acc[b.type] = b.id;
      return acc;
    }, {});

    if (!batches.length) {
      return res.status(400).json({ message: "No batches found. Create batches before auto-assign." });
    }

    let assignedCount = 0;

    for (const student of students) {
      const prediction = await generatePredictionForStudent(student);

      await pool.query(
        `INSERT INTO ai_predictions
        (student_id, predicted_batch, risk_level, recommendation, score_breakdown)
        VALUES (?, ?, ?, ?, ?)`,
        [
          student.id,
          prediction.predicted_batch,
          prediction.risk_level,
          prediction.recommendation,
          JSON.stringify(prediction.score_breakdown || {}),
        ]
      );

      if (batchByType[prediction.predicted_batch]) {
        await pool.query("UPDATE students SET current_batch_id = ? WHERE id = ?", [
          batchByType[prediction.predicted_batch],
          student.id,
        ]);
        assignedCount += 1;
      }
    }

    return res.json({
      message: "Auto-assignment completed",
      assignedCount,
      totalStudents: students.length,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  autoAssignStudents,
};
