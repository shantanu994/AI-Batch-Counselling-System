import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const { data } = await api.get(`/students/${user?.id || 1}`);
        setStudent(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load student profile");
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [user?.id]);

  if (loading) return <Loader label="Loading student dashboard" />;
  if (error) return <p className="error-msg">{error}</p>;

  const trendData = [
    { name: "Sem 1", score: Math.max(Number(student.academic_score) - 12, 0) },
    { name: "Sem 2", score: Math.max(Number(student.academic_score) - 7, 0) },
    { name: "Sem 3", score: Number(student.academic_score) },
  ];

  return (
    <section className="page-grid">
      <article className="panel-card">
        <h3>Student Profile</h3>
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Batch:</strong> {student.batch_name || "Not assigned"}</p>
        <p><strong>Predicted Batch:</strong> {student.predicted_batch || "Pending"}</p>
        <p><strong>Risk Level:</strong> {student.risk_level || "N/A"}</p>
        <p><strong>Attendance:</strong> {student.attendance_percentage}%</p>
        <p><strong>Academic Score:</strong> {student.academic_score}</p>
        <p><strong>Learning Ability:</strong> {student.learning_ability}</p>
      </article>

      <article className="panel-card">
        <h3>Performance Analytics</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1768ac" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#1768ac" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="score" stroke="#1768ac" fill="url(#scoreFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </article>

      <article className="panel-card">
        <h3>AI Recommendation</h3>
        <p>{student.recommendation || "AI recommendation will appear after prediction run."}</p>
        {student.score_breakdown ? (
          <div className="chips">
            <span>Performance: {student.score_breakdown.performance_weighted}</span>
            <span>Attendance: {student.score_breakdown.attendance_weighted}</span>
            <span>Learning: {student.score_breakdown.learning_weighted}</span>
            <span>Behaviour: {student.score_breakdown.behaviour_weighted}</span>
          </div>
        ) : null}
      </article>

      <article className="panel-card">
        <h3>Counselling Feedback</h3>
        {student.feedback?.length ? (
          <ul className="feedback-list">
            {student.feedback.map((item) => (
              <li key={item.id}>
                <strong>{item.counsellor_name}</strong>: {item.feedback_text}
              </li>
            ))}
          </ul>
        ) : (
          <p>No feedback available yet.</p>
        )}
      </article>
    </section>
  );
}

export default StudentDashboard;
