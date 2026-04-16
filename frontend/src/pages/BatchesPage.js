import { useEffect, useState } from "react";
import api from "../api/client";
import Loader from "../components/Loader";

const initForm = {
  name: "",
  type: "Regular Batch",
  capacity: 40,
  counsellor_id: "",
};

function BatchesPage() {
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(initForm);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const loadBatches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/batches");
      setBatches(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const createBatch = async (event) => {
    event.preventDefault();
    try {
      await api.post("/batches", {
        ...form,
        capacity: Number(form.capacity),
        counsellor_id: form.counsellor_id ? Number(form.counsellor_id) : null,
      });
      setForm(initForm);
      setStatus("Batch created successfully");
      loadBatches();
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to create batch");
    }
  };

  const triggerAutoAssign = async () => {
    try {
      const { data } = await api.post("/batches/auto-assign");
      setStatus(`Auto assignment completed for ${data.assignedCount}/${data.totalStudents} students`);
      loadBatches();
    } catch (error) {
      setStatus(error.response?.data?.message || "Auto-assignment failed");
    }
  };

  return (
    <section className="page-grid">
      <article className="panel-card">
        <div className="inline-head">
          <h3>Batch Management</h3>
          <button onClick={triggerAutoAssign}>Run AI Auto-Assign</button>
        </div>
        {status ? <p className="success-msg">{status}</p> : null}

        {loading ? <Loader label="Loading batches" /> : null}

        {!loading ? (
          <div className="cards-grid">
            {batches.length ? (
              batches.map((b) => (
                <article className="batch-card" key={b.id}>
                  <h4>{b.name}</h4>
                  <p>{b.type}</p>
                  <p>Capacity: {b.capacity}</p>
                  <p>Students: {b.student_count}</p>
                  <p>Counsellor: {b.counsellor_name || "Unassigned"}</p>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h4>No batches available</h4>
                <p>Create your first batch to start automated AI assignment workflows.</p>
              </div>
            )}
          </div>
        ) : null}
      </article>

      <article className="panel-card">
        <h3>Create Batch</h3>
        <form className="grid-form" onSubmit={createBatch}>
          <label>
            <span>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </label>
          <label>
            <span>Type</span>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            >
              <option>Regular Batch</option>
              <option>Remedial Batch</option>
              <option>Advanced Batch</option>
              <option>Special Monitoring Batch</option>
            </select>
          </label>
          <label>
            <span>Capacity</span>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
            />
          </label>
          <label>
            <span>Counsellor User ID</span>
            <input
              type="number"
              value={form.counsellor_id}
              onChange={(e) => setForm((p) => ({ ...p, counsellor_id: e.target.value }))}
            />
          </label>
          <button type="submit">Create Batch</button>
        </form>
      </article>
    </section>
  );
}

export default BatchesPage;
