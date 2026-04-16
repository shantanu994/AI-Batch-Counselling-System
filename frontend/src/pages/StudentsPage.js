import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import Loader from "../components/Loader";

function downloadBlob(data, filename, type) {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

const defaultForm = {
  roll_no: "",
  name: "",
  email: "",
  academic_score: 70,
  attendance_percentage: 80,
  backlogs: 0,
  interest_area: "Technical",
  goal_type: "Placement",
  learning_ability: "Moderate",
  behaviour_score: 70,
};

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/students", { params: { q: search } });
      setStudents(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const counts = useMemo(() => {
    return {
      highRisk: students.filter((s) => s.risk_level === "High").length,
      remedial: students.filter((s) => s.predicted_batch === "Remedial Batch").length,
    };
  }, [students]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await api.post("/students", form);
      setForm(defaultForm);
      loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student");
    }
  };

  const downloadStudentsExcel = async () => {
    try {
      const response = await api.get("/reports/students/excel", { responseType: "blob" });
      downloadBlob(
        response.data,
        "students-report.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export excel report");
    }
  };

  const downloadStudentPdf = async (studentId) => {
    try {
      const response = await api.get(`/reports/student/${studentId}/pdf`, { responseType: "blob" });
      downloadBlob(response.data, `student-${studentId}-report.pdf`, "application/pdf");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export student PDF");
    }
  };

  return (
    <section className="page-grid">
      <article className="panel-card">
        <div className="inline-head">
          <h3>Student Management</h3>
          <div className="chips">
            <span>High Risk: {counts.highRisk}</span>
            <span>Remedial Candidates: {counts.remedial}</span>
            <button type="button" className="secondary-btn" onClick={downloadStudentsExcel}>
              Export Excel Report
            </button>
          </div>
        </div>

        <div className="filters-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, or email"
          />
          <button onClick={loadStudents}>Search</button>
        </div>

        {loading ? <Loader label="Loading students" /> : null}
        {error ? <p className="error-msg">{error}</p> : null}

        {!loading ? (
          <div className="table-wrap">
            {students.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Academic</th>
                    <th>Attendance</th>
                    <th>Predicted Batch</th>
                    <th>Risk</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.roll_no}</td>
                      <td>{s.name}</td>
                      <td>{s.academic_score}</td>
                      <td>{s.attendance_percentage}%</td>
                      <td>{s.predicted_batch || "Pending"}</td>
                      <td>{s.risk_level || "N/A"}</td>
                      <td>
                        <button type="button" className="secondary-btn" onClick={() => downloadStudentPdf(s.id)}>
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <h4>No student records found</h4>
                <p>Try clearing filters or add a new student to begin performance tracking.</p>
              </div>
            )}
          </div>
        ) : null}
      </article>

      <article className="panel-card">
        <h3>Add Student</h3>
        <form className="grid-form" onSubmit={handleCreate}>
          {Object.keys(defaultForm).map((key) => (
            <label key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                type={typeof defaultForm[key] === "number" ? "number" : "text"}
              />
            </label>
          ))}
          <button type="submit">Add Student</button>
        </form>
      </article>
    </section>
  );
}

export default StudentsPage;
