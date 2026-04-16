import { useEffect, useState } from "react";
import api from "../api/client";
import Loader from "../components/Loader";

function CounsellorDashboard() {
  const [students, setStudents] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ student_id: "", feedback_text: "", progress_rating: 7 });
  const [sessionForm, setSessionForm] = useState({ student_id: "", scheduled_at: "", agenda: "" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadAssigned = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/counsellors/assigned-students");
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssigned();
  }, []);

  const submitFeedback = async (event) => {
    event.preventDefault();
    await api.post("/counsellors/feedback", {
      ...feedbackForm,
      student_id: Number(feedbackForm.student_id),
      progress_rating: Number(feedbackForm.progress_rating),
    });
    setStatus("Feedback submitted");
    setFeedbackForm({ student_id: "", feedback_text: "", progress_rating: 7 });
  };

  const scheduleSession = async (event) => {
    event.preventDefault();
    await api.post("/counsellors/schedule-session", {
      ...sessionForm,
      student_id: Number(sessionForm.student_id),
    });
    setStatus("Session scheduled");
    setSessionForm({ student_id: "", scheduled_at: "", agenda: "" });
  };

  return (
    <section className="page-grid">
      <article className="panel-card">
        <h3>Assigned Students</h3>
        {loading ? <Loader label="Loading assigned students" /> : null}
        {!loading ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Batch</th>
                  <th>Academic</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.batch_name}</td>
                    <td>{s.academic_score}</td>
                    <td>{s.attendance_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>

      <article className="panel-card">
        <h3>Add Counselling Feedback</h3>
        <form className="grid-form" onSubmit={submitFeedback}>
          <label>
            <span>Student ID</span>
            <input
              type="number"
              value={feedbackForm.student_id}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, student_id: e.target.value }))}
              required
            />
          </label>
          <label>
            <span>Progress Rating (0-10)</span>
            <input
              type="number"
              value={feedbackForm.progress_rating}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, progress_rating: e.target.value }))}
              required
            />
          </label>
          <label>
            <span>Feedback</span>
            <textarea
              value={feedbackForm.feedback_text}
              onChange={(e) => setFeedbackForm((p) => ({ ...p, feedback_text: e.target.value }))}
              required
            />
          </label>
          <button type="submit">Submit Feedback</button>
        </form>

        <h3>Schedule Session</h3>
        <form className="grid-form" onSubmit={scheduleSession}>
          <label>
            <span>Student ID</span>
            <input
              type="number"
              value={sessionForm.student_id}
              onChange={(e) => setSessionForm((p) => ({ ...p, student_id: e.target.value }))}
              required
            />
          </label>
          <label>
            <span>Date & Time</span>
            <input
              type="datetime-local"
              value={sessionForm.scheduled_at}
              onChange={(e) => setSessionForm((p) => ({ ...p, scheduled_at: e.target.value }))}
              required
            />
          </label>
          <label>
            <span>Agenda</span>
            <textarea
              value={sessionForm.agenda}
              onChange={(e) => setSessionForm((p) => ({ ...p, agenda: e.target.value }))}
              required
            />
          </label>
          <button type="submit">Schedule</button>
        </form>

        {status ? <p className="success-msg">{status}</p> : null}
      </article>
    </section>
  );
}

export default CounsellorDashboard;
