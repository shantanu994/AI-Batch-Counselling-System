import { motion } from "framer-motion";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

function StatCard({ title, value, accent, subtitle, trend }) {
  const isPositive = trend && trend.direction !== "down";

  return (
    <motion.article
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ "--accent": accent }}
    >
      <p className="stat-title">{title}</p>
      <h3>{value}</h3>
      {trend ? (
        <p className={`trend-chip ${isPositive ? "up" : "down"}`}>
          {isPositive ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
          {trend.label}
        </p>
      ) : null}
      {subtitle ? <p className="stat-subtitle">{subtitle}</p> : null}
    </motion.article>
  );
}

export default StatCard;
