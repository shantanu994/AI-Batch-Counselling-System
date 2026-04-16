import { useEffect, useState } from "react";
import api from "../api/client";
import Loader from "./Loader";

function NotificationPanel({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/notifications");
        setItems(data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [open]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: 1 } : item)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update notification");
    }
  };

  if (!open) return null;

  return (
    <section className="notification-panel">
      <div className="notification-head">
        <h4>Notifications</h4>
        <button type="button" className="ghost-btn" onClick={onClose}>Close</button>
      </div>

      {loading ? <Loader label="Loading notifications" /> : null}
      {error ? <p className="error-msg">{error}</p> : null}

      {!loading && !items.length ? (
        <div className="empty-state compact">
          <h4>No notifications</h4>
          <p>You are all caught up.</p>
        </div>
      ) : null}

      {!loading ? (
        <div className="notification-list">
          {items.map((item) => (
            <article key={item.id} className={`notification-item ${item.is_read ? "read" : "unread"}`}>
              <h5>{item.title}</h5>
              <p>{item.message}</p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
              {!item.is_read ? (
                <button type="button" className="link-btn" onClick={() => markRead(item.id)}>
                  Mark as read
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default NotificationPanel;
