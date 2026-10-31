import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  CheckCircle2,
  Calendar,
  Star,
  MessageSquare,
  AlertCircle,
  Clock,
  Check,
} from "lucide-react";

function Notifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
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
        setError(err.response?.data?.error || "Could not load campus notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [isAuthenticated]);

  const markRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(err.response?.data?.error || "Could not mark notification as read.");
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "request":
        return <MessageSquare size={18} style={{ color: "var(--primary-600)" }} />;
      case "scheduled":
        return <Calendar size={18} style={{ color: "var(--violet-600)" }} />;
      case "review":
        return <Star size={18} style={{ color: "var(--amber-600)" }} />;
      case "status":
        return <CheckCircle2 size={18} style={{ color: "var(--emerald-600)" }} />;
      default:
        return <Bell size={18} style={{ color: "var(--slate-500)" }} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredList = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <div className="notifications-page-container">
      <div className="card notifications-sheet-card">
        <div className="notifications-header-row">
          <div className="notifications-title-group">
            <div className="notifications-icon-wrap">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="notifications-title">Campus Notifications</h1>
              <p className="notifications-desc">
                Stay updated on skill requests, session schedules, and student reviews.
              </p>
            </div>
          </div>

          <div className="notifications-filter-tabs">
            <button
              type="button"
              className={`notif-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ margin: "1rem 1.5rem 0" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading notification feed...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state" style={{ margin: "2rem" }}>
            <div className="empty-state-icon">
              <Bell size={24} />
            </div>
            <h3 className="empty-state-title">
              {filter === "unread" ? "You're all caught up!" : "No notifications yet"}
            </h3>
            <p className="empty-state-desc">
              When peers request your skills or your mentors schedule sessions, alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="notifications-list-group">
            {filteredList.map((n) => (
              <div
                key={n._id}
                className={`notification-item-row ${n.isRead ? "item-read" : "item-unread"}`}
              >
                <div className="notif-type-icon-box">{getNotifIcon(n.type)}</div>
                <div className="notif-content-col">
                  <p className="notif-message-text">{n.message}</p>
                  <span className="notif-timestamp">
                    <Clock size={12} style={{ display: "inline", marginRight: "0.25rem" }} />
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </span>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-small notif-mark-read-btn"
                    onClick={() => markRead(n._id)}
                    title="Mark as read"
                  >
                    <Check size={14} />
                    <span>Mark read</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
