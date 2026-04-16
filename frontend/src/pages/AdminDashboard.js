import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import api from "../api/client";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

const COLORS = ["#1768ac", "#8f2d56", "#f4a259", "#2f9e44"];

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/admin");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!data) return [];

    const highPerformers = data.performanceDistribution.find((item) => item.category === "High")?.count || 0;
    const totalStudents = data.totals.students || 1;
    const highShare = ((highPerformers / totalStudents) * 100).toFixed(1);

    const avgAttendance =
      data.attendanceTrends?.length > 0
        ? data.attendanceTrends[data.attendanceTrends.length - 1].avg_attendance
        : 0;

    return [
      {
        title: "Total Students",
        value: data.totals.students,
        accent: "#1768ac",
        trend: { direction: "up", label: `${highShare}% high performers` },
      },
      {
        title: "Total Batches",
        value: data.totals.batches,
        accent: "#2f9e44",
        trend: { direction: "up", label: "Balanced allocation" },
      },
      {
        title: "Total Counsellors",
        value: data.totals.counsellors,
        accent: "#8f2d56",
        trend: { direction: avgAttendance >= 75 ? "up" : "down", label: `Avg attendance ${avgAttendance}%` },
      },
    ];
  }, [data]);

  if (loading) return <Loader label="Loading dashboard" />;
  if (error) return <p className="error-msg">{error}</p>;

  return (
    <section className="page-grid">
      <div className="stats-grid">
        {stats.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <article className="insight-banner">
        <h3>AI Operations Brief</h3>
        <p>
          Batch intelligence is actively balancing performance levels, attendance risks, and mentoring
          load across counsellors.
        </p>
      </article>

      <article className="chart-card">
        <h3>Performance Distribution</h3>
        <div className="chart-shell chart-shell-blue">
          <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.performanceDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1768ac" radius={[8, 8, 0, 0]} />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="chart-card">
        <h3>Attendance Trends</h3>
        <div className="chart-shell chart-shell-rose">
          <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.attendanceTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="avg_attendance" stroke="#8f2d56" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="chart-card">
        <h3>Batch Distribution</h3>
        <div className="chart-shell chart-shell-gold">
          <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data.batchDistribution} dataKey="count" nameKey="batch_type" outerRadius={100}>
              {data.batchDistribution.map((entry, index) => (
                <Cell key={`c-${entry.batch_type}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

export default AdminDashboard;
