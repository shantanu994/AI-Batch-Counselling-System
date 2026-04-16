const pool = require("../config/db");

async function getNotifications(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ]);
    return res.json({ message: "Notification updated" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getNotifications, markNotificationRead };
