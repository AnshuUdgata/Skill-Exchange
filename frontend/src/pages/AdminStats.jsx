import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function AdminStats() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/analytics/admin/stats");
        setStats(res.data.stats || null);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load stats.");
      }
    };
    fetchStats();
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <div className="empty-state">Admin access required.</div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      {error && <div className="error-text">{error}</div>}
      {!stats ? (
        <div className="empty-state">Loading stats...</div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Skills</span>
            <strong>{stats.totalSkills}</strong>
          </div>
          <div className="stat-card">
            <span>Total Users</span>
            <strong>{stats.totalUsers}</strong>
          </div>
          <div className="stat-card">
            <span>Total Requests</span>
            <strong>{stats.totalRequests}</strong>
          </div>
          <div className="stat-card">
            <span>Completed Sessions</span>
            <strong>{stats.completedSessions}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStats;
