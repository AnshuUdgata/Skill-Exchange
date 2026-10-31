import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  ExternalLink,
  Flame,
  GraduationCap,
  Info,
  MapPin,
  MessageSquare,
  PlusCircle,
  Star,
  Trash2,
  User,
  Video,
  X,
  AlertCircle,
  Check,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("received"); // 'received' | 'sent' | 'skills'

  // Modals state
  const [scheduleModalRequest, setScheduleModalRequest] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    meetingMode: "Online",
    meetingLink: "",
    location: "",
  });

  const [progressModalRequest, setProgressModalRequest] = useState(null);
  const [progressFormRole, setProgressFormRole] = useState("");
  const [progressFormData, setProgressFormData] = useState({
    progressStatus: "Not Started",
    notes: "",
  });

  const [reviewModalRequest, setReviewModalRequest] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    comment: "",
  });

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const [skillsRes, sentRes, receivedRes, trendingRes] = await Promise.all([
          API.get("/skills/my-skills"),
          API.get("/requests/sent"),
          API.get("/requests/received"),
          API.get("/analytics/trending").catch(() => ({ data: { trending: [] } })),
        ]);

        setMySkills(skillsRes.data.skills || []);
        setSentRequests(sentRes.data.requests || []);
        setReceivedRequests(receivedRes.data.requests || []);
        setTrendingSkills(trendingRes.data.trending || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteSkill = async (skillId) => {
    const confirmed = window.confirm("Are you sure you want to delete this skill permanently?");
    if (!confirmed) return;

    try {
      await API.delete(`/skills/${skillId}`);
      setMySkills((prev) => prev.filter((skill) => skill._id !== skillId));
      showSuccess("Skill removed successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete skill.");
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await API.put(`/requests/${requestId}/status`, { status });
      setReceivedRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
      setSentRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
      showSuccess(`Request status updated to "${status}".`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not update request status.");
    }
  };

  // Scheduling handlers
  const openScheduleModal = (request) => {
    setScheduleModalRequest(request);
    setScheduleFormData({
      scheduledDate: request.scheduledDate ? request.scheduledDate.slice(0, 10) : "",
      scheduledTime: request.scheduledTime || "",
      meetingMode: request.meetingMode || "Online",
      meetingLink: request.meetingLink || request.location || "",
      location: request.location || "",
    });
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleModalRequest) return;
    try {
      const { scheduledDate, scheduledTime, meetingMode, meetingLink, location } = scheduleFormData;
      const body = {
        scheduledDate,
        scheduledTime,
        meetingMode,
        meetingLink: meetingMode === "Offline" ? undefined : meetingLink,
        location: meetingMode === "Offline" ? meetingLink : location,
      };

      const res = await API.put(`/requests/${scheduleModalRequest._id}/schedule`, body);
      const updated = res.data.request;
      setReceivedRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setSentRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setScheduleModalRequest(null);
      showSuccess("Session successfully scheduled!");
    } catch (err) {
      setError(err.response?.data?.error || "Could not schedule session.");
    }
  };

  // Progress update handlers
  const openProgressModal = (request, forRole) => {
    setProgressModalRequest(request);
    setProgressFormRole(forRole);
    setProgressFormData({
      progressStatus: request.progressStatus || "Not Started",
      notes: forRole === "mentor" ? request.mentorNotes || "" : request.learnerNotes || "",
    });
  };

  const submitProgressUpdate = async (e) => {
    e.preventDefault();
    if (!progressModalRequest) return;
    try {
      const body = { progressStatus: progressFormData.progressStatus };
      if (progressFormRole === "mentor") {
        body.mentorNotes = progressFormData.notes;
      } else {
        body.learnerNotes = progressFormData.notes;
      }

      const res = await API.put(`/requests/${progressModalRequest._id}/progress`, body);
      const updated = res.data.request;
      setReceivedRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setSentRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setProgressModalRequest(null);
      showSuccess("Progress notes updated successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not update progress notes.");
    }
  };

  // Review handlers
  const openReviewModal = (requestId) => {
    setReviewModalRequest(requestId);
    setReviewFormData({ rating: 0, comment: "" });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalRequest) return;
    if (reviewFormData.rating < 1 || reviewFormData.rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }
    try {
      await API.post(`/reviews`, {
        sessionRequestId: reviewModalRequest,
        rating: reviewFormData.rating,
        comment: reviewFormData.comment,
      });
      const sentRes = await API.get("/requests/sent");
      setSentRequests(sentRes.data.requests || []);
      setReviewModalRequest(null);
      showSuccess("Thank you! Your feedback has been published.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit review.");
    }
  };

  const handleMarkCompleted = async (requestId) => {
    try {
      await handleStatusUpdate(requestId, "Completed");
      openReviewModal(requestId);
    } catch (err) {
      setError(err.response?.data?.error || "Could not mark session complete.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return <span className="badge badge-primary">Accepted</span>;
      case "Scheduled":
        return <span className="badge badge-violet">Scheduled</span>;
      case "Completed":
        return <span className="badge badge-success">Completed</span>;
      case "Rejected":
        return <span className="badge badge-neutral" style={{ color: "var(--rose-600)" }}>Rejected</span>;
      default:
        return <span className="badge badge-warning">Pending</span>;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const completedCount = sentRequests.filter((r) => r.status === "Completed").length +
    receivedRequests.filter((r) => r.status === "Completed").length;

  return (
    <div className="dashboard-container">
      {/* Alert Banners */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} style={{ marginLeft: "auto" }}>
            <X size={15} />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading your campus dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-3col-layout">
          {/* ================= LEFT COLUMN: Profile & Quick Nav ================= */}
          <aside className="dashboard-left-col">
            <div className="card dashboard-profile-summary-card">
              <div className="profile-summary-cover" />
              <div className="profile-summary-avatar-wrap">
                {user?.photo ? (
                  <img src={user.photo} alt={user.name} className="profile-summary-avatar" />
                ) : (
                  <div className="profile-summary-avatar-fallback">{getInitials(user?.name)}</div>
                )}
              </div>
              <div className="profile-summary-body">
                <h2 className="profile-summary-name">{user?.name}</h2>
                <p className="profile-summary-email">{user?.email}</p>
                <div className="profile-summary-academic">
                  <span className="badge badge-primary">
                    <GraduationCap size={12} />
                    {user?.branch || "Student"} {user?.year ? `· Year ${user.year}` : ""}
                  </span>
                </div>
                {user?.experience && (
                  <p className="profile-summary-bio">"{user.experience}"</p>
                )}

                <div className="profile-summary-divider" />

                <div className="profile-quick-stats">
                  <div className="quick-stat-row">
                    <span>Skills Offered</span>
                    <strong>{mySkills.length}</strong>
                  </div>
                  <div className="quick-stat-row">
                    <span>Requests Sent</span>
                    <strong>{sentRequests.length}</strong>
                  </div>
                  <div className="quick-stat-row">
                    <span>Sessions Completed</span>
                    <strong>{completedCount}</strong>
                  </div>
                </div>

                <div className="profile-summary-divider" />

                <div className="profile-summary-actions">
                  <Link to="/profile" className="btn btn-secondary btn-small" style={{ width: "100%" }}>
                    <User size={14} />
                    <span>Edit Profile</span>
                  </Link>
                  <Link to="/add-skill" className="btn btn-primary btn-small" style={{ width: "100%" }}>
                    <PlusCircle size={14} />
                    <span>Offer a Skill</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="card quick-links-card">
              <h3 className="widget-card-title">Quick Actions</h3>
              <nav className="quick-links-nav">
                <Link to="/skills" className="quick-link-item">
                  <Compass size={16} />
                  <span>Explore Marketplace</span>
                </Link>
                <Link to="/notifications" className="quick-link-item">
                  <Clock size={16} />
                  <span>Notification Center</span>
                </Link>
                {user?._id && (
                  <Link to={`/instructor/${user._id}`} className="quick-link-item">
                    <ExternalLink size={16} />
                    <span>View Public Profile</span>
                  </Link>
                )}
              </nav>
            </div>
          </aside>

          {/* ================= CENTER COLUMN: Main Content & Tabs ================= */}
          <main className="dashboard-center-col">
            {/* Top Metric Cards */}
            <div className="metrics-cards-grid">
              <div className="metric-card">
                <div className="metric-icon-wrap" style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="metric-label">Skills Offered</span>
                  <h3 className="metric-val">{mySkills.length}</h3>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap" style={{ backgroundColor: "var(--amber-50)", color: "var(--amber-600)" }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <span className="metric-label">Requests Received</span>
                  <h3 className="metric-val">{receivedRequests.length}</h3>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap" style={{ backgroundColor: "var(--violet-50)", color: "var(--violet-600)" }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="metric-label">Requests Sent</span>
                  <h3 className="metric-val">{sentRequests.length}</h3>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap" style={{ backgroundColor: "var(--emerald-50)", color: "var(--emerald-600)" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <span className="metric-label">Completed</span>
                  <h3 className="metric-val">{completedCount}</h3>
                </div>
              </div>
            </div>

            {/* Segmented Navigation Tabs */}
            <div className="card dashboard-content-card">
              <div className="dashboard-tabs-bar">
                <button
                  type="button"
                  className={`dashboard-tab ${activeTab === "received" ? "active" : ""}`}
                  onClick={() => setActiveTab("received")}
                >
                  <MessageSquare size={16} />
                  <span>Requests Received</span>
                  <span className="tab-counter-badge">{receivedRequests.length}</span>
                </button>

                <button
                  type="button"
                  className={`dashboard-tab ${activeTab === "sent" ? "active" : ""}`}
                  onClick={() => setActiveTab("sent")}
                >
                  <Calendar size={16} />
                  <span>Requests Sent</span>
                  <span className="tab-counter-badge">{sentRequests.length}</span>
                </button>

                <button
                  type="button"
                  className={`dashboard-tab ${activeTab === "skills" ? "active" : ""}`}
                  onClick={() => setActiveTab("skills")}
                >
                  <BookOpen size={16} />
                  <span>My Offered Skills</span>
                  <span className="tab-counter-badge">{mySkills.length}</span>
                </button>
              </div>

              {/* ================= TAB 1: Requests Received ================= */}
              {activeTab === "received" && (
                <div className="tab-panel-body">
                  {receivedRequests.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <MessageSquare size={24} />
                      </div>
                      <h4 className="empty-state-title">No session requests received yet</h4>
                      <p className="empty-state-desc">
                        When classmates find your skills on the marketplace, their requests will appear here.
                      </p>
                      <Link to="/add-skill" className="btn btn-primary btn-small">
                        <PlusCircle size={14} />
                        <span>Offer Another Skill</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="requests-list">
                      {receivedRequests.map((request) => (
                        <div key={request._id} className="request-item-card">
                          <div className="request-item-header">
                            <div>
                              <div className="request-title-row">
                                <h4 className="request-skill-title">{request.skill?.title || "Skill Session"}</h4>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="request-sender-info">
                                From: <strong>{request.requester?.name || "Student"}</strong> ({request.requester?.email})
                              </p>
                            </div>
                            <span className="request-time-ago">
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>

                          {request.message && (
                            <div className="request-message-quote">
                              <p>"{request.message}"</p>
                            </div>
                          )}

                          {/* Scheduling & Progress details if present */}
                          {(request.scheduledDate || request.meetingLink || request.location) && (
                            <div className="session-scheduled-box">
                              <div className="session-scheduled-item">
                                <Calendar size={14} />
                                <span>{request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : "Date TBD"}</span>
                                {request.scheduledTime && <span>at {request.scheduledTime}</span>}
                              </div>
                              <div className="session-scheduled-item">
                                {request.meetingMode === "Offline" ? <MapPin size={14} /> : <Video size={14} />}
                                <span>
                                  {request.meetingMode || "Online"}:{" "}
                                  {request.meetingLink || request.location || "Details pending"}
                                </span>
                              </div>
                            </div>
                          )}

                          {request.mentorNotes && (
                            <div className="notes-box">
                              <small><strong>Your Mentor Notes:</strong> {request.mentorNotes}</small>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="request-item-actions">
                            {request.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-small"
                                  onClick={() => handleStatusUpdate(request._id, "Accepted")}
                                >
                                  <Check size={14} />
                                  <span>Accept</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-small"
                                  onClick={() => handleStatusUpdate(request._id, "Rejected")}
                                >
                                  <X size={14} />
                                  <span>Decline</span>
                                </button>
                              </>
                            )}

                            {request.status === "Accepted" && (
                              <button
                                type="button"
                                className="btn btn-primary btn-small"
                                onClick={() => openScheduleModal(request)}
                              >
                                <Calendar size={14} />
                                <span>Schedule Session</span>
                              </button>
                            )}

                            {request.status === "Scheduled" && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-success btn-small"
                                  onClick={() => handleStatusUpdate(request._id, "Completed")}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Mark Completed</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  onClick={() => openScheduleModal(request)}
                                >
                                  <Edit3 size={14} />
                                  <span>Reschedule</span>
                                </button>
                              </>
                            )}

                            {(request.status === "Scheduled" || request.status === "Accepted") && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => openProgressModal(request, "mentor")}
                              >
                                <Edit3 size={14} />
                                <span>Mentor Notes</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: Requests Sent ================= */}
              {activeTab === "sent" && (
                <div className="tab-panel-body">
                  {sentRequests.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Compass size={24} />
                      </div>
                      <h4 className="empty-state-title">You haven't requested any sessions yet</h4>
                      <p className="empty-state-desc">
                        Explore skills taught by fellow students and send your first learning request!
                      </p>
                      <Link to="/skills" className="btn btn-primary btn-small">
                        <Compass size={14} />
                        <span>Discover Skills</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="requests-list">
                      {sentRequests.map((request) => (
                        <div key={request._id} className="request-item-card">
                          <div className="request-item-header">
                            <div>
                              <div className="request-title-row">
                                <h4 className="request-skill-title">{request.skill?.title || "Skill Session"}</h4>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="request-sender-info">
                                Instructor: <strong>{request.owner?.name || "Peer Mentor"}</strong> ({request.owner?.email})
                              </p>
                            </div>
                            <span className="request-time-ago">
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>

                          {(request.scheduledDate || request.meetingLink || request.location) && (
                            <div className="session-scheduled-box">
                              <div className="session-scheduled-item">
                                <Calendar size={14} />
                                <span>{request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : "Date TBD"}</span>
                                {request.scheduledTime && <span>at {request.scheduledTime}</span>}
                              </div>
                              <div className="session-scheduled-item">
                                {request.meetingMode === "Offline" ? <MapPin size={14} /> : <Video size={14} />}
                                <span>
                                  {request.meetingMode || "Online"}:{" "}
                                  {request.meetingLink || request.location || "Details pending"}
                                </span>
                              </div>
                            </div>
                          )}

                          {request.learnerNotes && (
                            <div className="notes-box">
                              <small><strong>Your Learning Notes:</strong> {request.learnerNotes}</small>
                            </div>
                          )}

                          <div className="request-item-actions">
                            {(request.status === "Scheduled" || request.status === "Accepted") && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  onClick={() => openProgressModal(request, "learner")}
                                >
                                  <Edit3 size={14} />
                                  <span>My Notes</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-success btn-small"
                                  onClick={() => handleMarkCompleted(request._id)}
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Mark Completed</span>
                                </button>
                              </>
                            )}

                            {request.status === "Completed" && (
                              <button
                                type="button"
                                className="btn btn-outline btn-small"
                                onClick={() => openReviewModal(request._id)}
                              >
                                <Star size={14} />
                                <span>Leave Rating & Review</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: My Offered Skills ================= */}
              {activeTab === "skills" && (
                <div className="tab-panel-body">
                  {mySkills.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <BookOpen size={24} />
                      </div>
                      <h4 className="empty-state-title">You haven't listed any skills yet</h4>
                      <p className="empty-state-desc">
                        Offer a skill in programming, design, academics, or communication to start mentoring peers.
                      </p>
                      <Link to="/add-skill" className="btn btn-primary btn-small">
                        <PlusCircle size={14} />
                        <span>Offer Your First Skill</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="dashboard-skills-grid">
                      {mySkills.map((skill) => (
                        <div key={skill._id} className="card my-skill-card">
                          <div className="my-skill-header">
                            <span className="badge badge-primary">{skill.category}</span>
                            <span className="badge badge-neutral">{skill.mode}</span>
                          </div>
                          <h4 className="my-skill-title">{skill.title}</h4>
                          <p className="my-skill-desc">{skill.description}</p>
                          <div className="my-skill-footer">
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => navigate(`/skills/edit/${skill._id}`)}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-small"
                              onClick={() => handleDeleteSkill(skill._id)}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* ================= RIGHT COLUMN: Community Widgets ================= */}
          <aside className="dashboard-right-col">
            {/* Trending Skills Widget */}
            <div className="card widget-card">
              <div className="widget-card-header">
                <div className="widget-header-title-wrap">
                  <Flame size={18} className="widget-icon-flame" />
                  <h3 className="widget-card-title">Trending on Campus</h3>
                </div>
                <Link to="/skills" className="widget-header-link">
                  View all
                </Link>
              </div>

              <div className="trending-skills-list">
                {trendingSkills.length > 0 ? (
                  trendingSkills.slice(0, 5).map((t, idx) => (
                    <div key={t._id} className="trending-skill-item">
                      <span className="trending-rank-num">0{idx + 1}</span>
                      <div className="trending-skill-info">
                        <strong className="trending-skill-name">{t.title}</strong>
                        <span className="trending-skill-meta">
                          {t.category} · {t.count} {t.count === 1 ? "request" : "requests"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="widget-empty-text">No trending data yet. Be the first to start a session!</p>
                )}
              </div>
            </div>

            {/* Peer Learning Tips Widget */}
            <div className="card widget-card">
              <div className="widget-card-header">
                <div className="widget-header-title-wrap">
                  <Info size={18} style={{ color: "var(--primary-600)" }} />
                  <h3 className="widget-card-title">Mentorship Tips</h3>
                </div>
              </div>
              <ul className="learning-tips-list">
                <li>
                  <strong>Set clear session goals:</strong> Clarify what topic or bug you will work on before starting.
                </li>
                <li>
                  <strong>Share links early:</strong> Provide Google Meet, Zoom, or campus library meeting spots.
                </li>
                <li>
                  <strong>Review your mentor:</strong> Ratings help fellow students find reliable instructors.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* ================= MODAL: Schedule Session ================= */}
      {scheduleModalRequest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Schedule Learning Session</h3>
              <button type="button" className="btn-icon" onClick={() => setScheduleModalRequest(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitSchedule}>
              <div className="modal-body">
                <p className="modal-subtitle">
                  For: <strong>{scheduleModalRequest.skill?.title}</strong> with{" "}
                  <strong>{scheduleModalRequest.requester?.name || "Student"}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">Session Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={scheduleFormData.scheduledDate}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session Time</label>
                  <input
                    type="time"
                    required
                    className="input-field"
                    value={scheduleFormData.scheduledTime}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, scheduledTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Meeting Mode</label>
                  <select
                    className="select-field"
                    value={scheduleFormData.meetingMode}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, meetingMode: e.target.value })}
                  >
                    <option value="Online">Online (Google Meet / Zoom / Discord)</option>
                    <option value="Offline">Offline (Campus Library / Lab / Common Room)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {scheduleFormData.meetingMode === "Offline" ? "Campus Location" : "Meeting Link"}
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder={scheduleFormData.meetingMode === "Offline" ? "e.g., Central Library 2nd Floor Study Room" : "e.g., https://meet.google.com/xyz"}
                    value={scheduleFormData.meetingLink}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, meetingLink: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setScheduleModalRequest(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-small">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Update Progress ================= */}
      {progressModalRequest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {progressFormRole === "mentor" ? "Mentor Session Notes" : "Learner Progress Notes"}
              </h3>
              <button type="button" className="btn-icon" onClick={() => setProgressModalRequest(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitProgressUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Overall Progress Status</label>
                  <select
                    className="select-field"
                    value={progressFormData.progressStatus}
                    onChange={(e) => setProgressFormData({ ...progressFormData, progressStatus: e.target.value })}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Learning Resources</label>
                  <textarea
                    rows={4}
                    className="textarea-field"
                    placeholder="Key concepts covered, homework/exercise links, questions to review next time..."
                    value={progressFormData.notes}
                    onChange={(e) => setProgressFormData({ ...progressFormData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setProgressModalRequest(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-small">
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: Star Review ================= */}
      {reviewModalRequest && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Rate Your Peer Mentor</h3>
              <button type="button" className="btn-icon" onClick={() => setReviewModalRequest(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitReview}>
              <div className="modal-body">
                <p className="modal-subtitle">
                  How was your experience learning with your mentor? Your feedback helps the campus community grow.
                </p>

                <div className="stars-rating-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-pick-btn ${reviewFormData.rating >= star ? "active" : ""}`}
                      onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star size={24} />
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label">Feedback / Testimonial (Optional)</label>
                  <textarea
                    rows={4}
                    className="textarea-field"
                    placeholder="Share what they taught well, communication, or advice for future learners..."
                    value={reviewFormData.comment}
                    onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setReviewModalRequest(null)}>
                  Skip
                </button>
                <button type="submit" className="btn btn-primary btn-small">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
