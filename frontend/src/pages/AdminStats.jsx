import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import {
  Shield,
  BookOpen,
  Users,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

function AdminStats() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await API.get("/analytics/admin/stats");
        setStats(res.data.stats || null);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load administrative stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") {
    return (
      <div className="empty-state" style={{ margin: "3rem auto", maxWidth: "28rem" }}>
        <Shield size={32} style={{ color: "var(--rose-500)", marginBottom: "0.5rem" }} />
        <h3 className="empty-state-title">Access Restricted</h3>
        <p className="empty-state-desc">You need administrative privileges to view platform telemetry.</p>
        <Link to="/dashboard" className="btn btn-secondary btn-small">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/dashboard" className="btn btn-secondary btn-small">
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="card admin-header-card">
        <div className="admin-header-icon-box">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="admin-title">Campus Admin Telemetry</h1>
          <p className="admin-subtitle">
            Platform-wide metrics for skills listed, student participation, and session completions.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading analytics metrics...</p>
        </div>
      ) : stats ? (
        <>
          <div className="admin-stats-grid">
            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}>
                <BookOpen size={20} />
              </div>
              <div>
                <span className="metric-label">Total Skills Listed</span>
                <h3 className="metric-val">{stats.totalSkills}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: "var(--violet-50)", color: "var(--violet-600)" }}>
                <Users size={20} />
              </div>
              <div>
                <span className="metric-label">Registered Students</span>
                <h3 className="metric-val">{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: "var(--amber-50)", color: "var(--amber-600)" }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <span className="metric-label">Total Session Requests</span>
                <h3 className="metric-val">{stats.totalRequests}</h3>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-wrap" style={{ backgroundColor: "var(--emerald-50)", color: "var(--emerald-600)" }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="metric-label">Completed Mentorships</span>
                <h3 className="metric-val">{stats.completedSessions}</h3>
              </div>
            </div>
          </div>

          {/* Top Mentors Table / List */}
          {stats.topMentors && stats.topMentors.length > 0 && (
            <div className="card admin-mentors-card">
              <div className="card-header-styled">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <TrendingUp size={20} style={{ color: "var(--primary-600)" }} />
                  <h2 className="section-card-title">Top Peer Instructors on Campus</h2>
                </div>
                <p className="section-card-desc">Ranked by accepted, scheduled, and completed student sessions.</p>
              </div>

              <div className="top-mentors-list">
                {stats.topMentors.map((m, idx) => (
                  <div key={m._id} className="top-mentor-row">
                    <span className="mentor-rank-badge">#{idx + 1}</span>
                    <div className="mentor-info">
                      <strong>{m.name}</strong>
                    </div>
                    <span className="badge badge-primary">
                      {m.count} {m.count === 1 ? "active session" : "active sessions"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

export default AdminStats;
