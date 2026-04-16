const pool = require("../config/db");

async function getAdminStats(req, res, next) {
  try {
    const [[studentCount]] = await pool.query("SELECT COUNT(*) AS total FROM students");
    const [[batchCount]] = await pool.query("SELECT COUNT(*) AS total FROM batches");
    const [[counsellorCount]] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'counsellor'"
    );

    const [performanceDistribution] = await pool.query(
      `SELECT
          CASE
            WHEN academic_score >= 80 THEN 'High'
            WHEN academic_score >= 60 THEN 'Average'
            ELSE 'Slow'
          END AS category,
          COUNT(*) AS count
       FROM students
       GROUP BY category`
    );

    const [attendanceTrends] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              ROUND(AVG(attendance_percentage), 2) AS avg_attendance
       FROM students
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month`
    );

    const [batchDistribution] = await pool.query(
      `SELECT b.type AS batch_type, COUNT(s.id) AS count
       FROM batches b
       LEFT JOIN students s ON s.current_batch_id = b.id
       GROUP BY b.type`
    );

    return res.json({
      totals: {
        students: studentCount.total,
        batches: batchCount.total,
        counsellors: counsellorCount.total,
      },
      performanceDistribution,
      attendanceTrends,
      batchDistribution,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAdminStats };
