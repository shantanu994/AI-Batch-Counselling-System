require("dotenv").config();
const app = require("./app");
const pool = require("./config/db");

const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await pool.query("SELECT 1");
    app.listen(port, () => {
      console.log(`Backend server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    if (error.code) {
      console.error("MySQL error code:", error.code);
    }
    console.error(
      `MySQL target: ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || 3306}/${process.env.MYSQL_DATABASE} (user: ${process.env.MYSQL_USER})`
    );
    process.exit(1);
  }
}

startServer();
