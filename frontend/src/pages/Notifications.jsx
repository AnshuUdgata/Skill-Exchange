import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

function Notifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await API.get("/notifications");
        setNotifications(res.data.notifications || []);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [isAuthenticated]);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      setError(err.response?.data?.error || "Could not mark notification.");
    }
  };

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      {error && <div className="error-text">{error}</div>}
      {loading ? (
        <div className="empty-state">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">No notifications.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n._id} className={n.isRead ? "read" : "unread"}>
              <div>
                <p>{n.message}</p>
                <small>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              {!n.isRead && (
                <button className="btn btn-secondary btn-small" onClick={() => markRead(n._id)}>
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
