import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduleFormRequestId, setScheduleFormRequestId] = useState(null);
  const [scheduleFormData, setScheduleFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    meetingMode: "Online",
    meetingLink: "",
    location: "",
  });
  const [progressFormRequestId, setProgressFormRequestId] = useState(null);
  const [progressFormRole, setProgressFormRole] = useState("");
  const [progressFormData, setProgressFormData] = useState({
    progressStatus: "Not Started",
    notes: "",
  });
  const [reviewFormRequestId, setReviewFormRequestId] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 0,
    comment: "",
  });
  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const [skillsResponse, sentResponse, receivedResponse] = await Promise.all([
          API.get("/skills/my-skills"),
          API.get("/requests/sent"),
          API.get("/requests/received"),
        ]);

        setMySkills(skillsResponse.data.skills || []);
        setSentRequests(sentResponse.data.requests || []);
        setReceivedRequests(receivedResponse.data.requests || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDeleteSkill = async (skillId) => {
    const confirmed = window.confirm("Delete this skill permanently?");
    if (!confirmed) return;

    try {
      await API.delete(`/skills/${skillId}`);
      setMySkills((prev) => prev.filter((skill) => skill._id !== skillId));
    } catch (err) {
      setError(err.response?.data?.error || "Could not delete skill.");
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await API.put(`/requests/${requestId}/status`, { status });
      setReceivedRequests((prev) =>
        prev.map((request) =>
          request._id === requestId ? { ...request, status } : request
        )
      );
      setSentRequests((prev) =>
        prev.map((request) =>
          request._id === requestId ? { ...request, status } : request
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || "Could not update request status.");
    }
  };

  const handleSchedule = (request) => {
    setScheduleFormRequestId(request._id);
    setScheduleFormData({
      scheduledDate: request.scheduledDate ? request.scheduledDate.slice(0, 10) : "",
      scheduledTime: request.scheduledTime || "",
      meetingMode: request.meetingMode || "Online",
      meetingLink: request.meetingLink || request.location || "",
      location: request.location || "",
    });
  };

  const handleSubmitSchedule = async (requestId) => {
    try {
      const { scheduledDate, scheduledTime, meetingMode, meetingLink, location } = scheduleFormData;
      const body = {
        scheduledDate,
        scheduledTime,
        meetingMode,
        meetingLink: meetingMode === "Offline" ? undefined : meetingLink,
        location: meetingMode === "Offline" ? meetingLink : location,
      };

      const res = await API.put(`/requests/${requestId}/schedule`, body);
      const updated = res.data.request;
      setReceivedRequests((prev) => prev.map((r) => (r._id === requestId ? updated : r)));
      setSentRequests((prev) => prev.map((r) => (r._id === requestId ? updated : r)));
      setScheduleFormRequestId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Could not schedule session.");
    }
  };

  const renderScheduleDetails = (request) => {
    if (!request.scheduledDate && !request.scheduledTime && !request.meetingMode && !request.meetingLink && !request.location) {
      return null;
    }

    return (
      <div className="session-details">
        <p>
          <strong>Session:</strong> {request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString() : "TBD"} {request.scheduledTime || ""}
        </p>
        <p>
          <strong>Mode:</strong> {request.meetingMode || "TBD"}
        </p>
        <p>
          <strong>{request.meetingMode === "Offline" ? "Location" : "Meeting Link"}:</strong>{" "}
          {request.meetingMode === "Offline" ? request.location || request.meetingLink : request.meetingLink || request.location || "TBD"}
        </p>
      </div>
    );
  };

  const handleScheduleFormChange = (field, value) => {
    setScheduleFormData((prev) => ({ ...prev, [field]: value }));
  };

  const closeScheduleForm = () => {
    setScheduleFormRequestId(null);
  };

  const handleGiveReview = (requestId) => {
    setReviewFormRequestId(requestId);
    setReviewFormData({ rating: 0, comment: "" });
  };

  const handleReviewChange = (field, value) => {
    setReviewFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitReview = async (requestId) => {
    try {
      const { rating, comment } = reviewFormData;
      if (rating < 1 || rating > 5) {
        setError("Please select a star rating before submitting.");
        return;
      }
      await API.post(`/reviews`, { sessionRequestId: requestId, rating, comment });
      const sentResponse = await API.get("/requests/sent");
      setSentRequests(sentResponse.data.requests || []);
      setReviewFormRequestId(null);
      setReviewFormData({ rating: 0, comment: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit review.");
    }
  };

  const skipReview = () => {
    setReviewFormRequestId(null);
    setReviewFormData({ rating: 0, comment: "" });
  };

  const handleMarkCompleted = async (requestId) => {
    try {
      await handleStatusUpdate(requestId, "Completed");
      setReviewFormRequestId(requestId);
    } catch (err) {
      setError(err.response?.data?.error || "Could not mark session complete.");
    }
  };

  const handleUpdateProgress = (request, forRole) => {
    setProgressFormRequestId(request._id);
    setProgressFormRole(forRole);
    setProgressFormData({
      progressStatus: request.progressStatus || "Not Started",
      notes: forRole === "mentor" ? request.mentorNotes || "" : request.learnerNotes || "",
    });
  };

  const handleProgressFormChange = (field, value) => {
    setProgressFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitProgressUpdate = async (requestId) => {
    try {
      const body = { progressStatus: progressFormData.progressStatus };
      if (progressFormRole === "mentor") {
        body.mentorNotes = progressFormData.notes;
      } else {
        body.learnerNotes = progressFormData.notes;
      }

      const res = await API.put(`/requests/${requestId}/progress`, body);
      const updated = res.data.request;

      setReceivedRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setSentRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setProgressFormRequestId(null);
      setProgressFormRole("");
      setProgressFormData({ progressStatus: "Not Started", notes: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Could not update progress.");
    }
  };

  const closeProgressForm = () => {
    setProgressFormRequestId(null);
    setProgressFormRole("");
    setProgressFormData({ progressStatus: "Not Started", notes: "" });
  };

  const stats = [
    { label: "My Skills", value: mySkills.length },
    { label: "Requests Sent", value: sentRequests.length },
    { label: "Requests Received", value: receivedRequests.length },
    {
      label: "Accepted Requests",
      value: receivedRequests.filter((request) => request.status === "Accepted").length,
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Track your skills, requests, and sessions from one place.</p>
      </div>

      {error && <div className="error-text">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <section className="dashboard-section">
            <div className="section-heading">
              <p>My Skills</p>
              <h2>Skills you are offering right now.</h2>
            </div>
            <div className="skill-grid">
              {mySkills.length > 0 ? (
                mySkills.map((skill) => (
                  <div key={skill._id} className="skill-card">
                    <div className="skill-card-header">
                      <h3>{skill.title}</h3>
                      <span className="skill-badge">{skill.category}</span>
                    </div>
                    <p>{skill.description}</p>
                    <div className="skill-card-meta">
                      <span>{skill.mode}</span>
                      <span>Owner</span>
                    </div>
                    <div className="skill-card-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => navigate(`/skills/edit/${skill._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => handleDeleteSkill(skill._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">You have not added any skills yet.</div>
              )}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="requests-grid">
              <article className="request-card">
                <h3>Requests Sent</h3>
                {sentRequests.length > 0 ? (
                  <ul>
                    {sentRequests.map((request) => (
                      <li key={request._id}>
                        <div className="request-summary">
                          <strong>{request.skill?.title}</strong>
                          <span>{request.status}</span>
                          {renderScheduleDetails(request)}
                        </div>
                        <div className="request-actions">
                          {request.status === "Completed" && (request.requester?._id === currentUserId || request.requester?.id === currentUserId) && reviewFormRequestId !== request._id && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => handleGiveReview(request._id)}
                            >
                              Give Review
                            </button>
                          )}
                          {(request.status === "Scheduled" || request.status === "Accepted") && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => handleUpdateProgress(request, "learner")}
                            >
                              Update Progress
                            </button>
                          )}
                          {(request.status === "Scheduled" || request.status === "Accepted") && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-small"
                              onClick={() => handleMarkCompleted(request._id)}
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                        {reviewFormRequestId === request._id && (
                          <div className="review-form">
                            <p className="review-title">Rate your mentor</p>
                            <div className="stars-row">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className={reviewFormData.rating >= star ? "star selected" : "star"}
                                  onClick={() => handleReviewChange("rating", star)}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <label>
                              Review (optional)
                              <textarea
                                value={reviewFormData.comment}
                                onChange={(e) => handleReviewChange("comment", e.target.value)}
                                placeholder="Share a short review for the mentor"
                              />
                            </label>
                            <div className="form-actions">
                              <button
                                type="button"
                                className="btn btn-primary btn-small"
                                onClick={() => submitReview(request._id)}
                              >
                                Submit Review
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={skipReview}
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        )}
                        {progressFormRequestId === request._id && (
                          <div className="progress-form">
                            <label>
                              Progress Status
                              <select
                                value={progressFormData.progressStatus}
                                onChange={(e) => handleProgressFormChange("progressStatus", e.target.value)}
                              >
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                              </select>
                            </label>
                            <label>
                              Notes / Resources
                              <textarea
                                value={progressFormData.notes}
                                onChange={(e) => handleProgressFormChange("notes", e.target.value)}
                                placeholder="Enter your notes or resources here"
                              />
                            </label>
                            <div className="form-actions">
                              <button
                                type="button"
                                className="btn btn-primary btn-small"
                                onClick={() => submitProgressUpdate(request._id)}
                              >
                                Save Progress
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={closeProgressForm}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">No sent requests yet.</div>
                )}
              </article>

              <article className="request-card">
                <h3>Requests Received</h3>
                {receivedRequests.length > 0 ? (
                  <ul>
                    {receivedRequests.map((request) => (
                      <li key={request._id}>
                        <div>
                          <strong>{request.skill?.title}</strong>
                          <p>From: {request.requester?.name || "Unknown"}</p>
                        </div>
                        <div>
                          <span>{request.status}</span>
                          <div className="request-actions">
                            {request.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  onClick={() => handleStatusUpdate(request._id, "Accepted")}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  onClick={() => handleStatusUpdate(request._id, "Rejected")}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {request.status === "Accepted" && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => handleSchedule(request)}
                              >
                                Schedule Session
                              </button>
                            )}
                            {request.status === "Scheduled" && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => handleStatusUpdate(request._id, "Completed")}
                              >
                                Mark Completed
                              </button>
                            )}
                            {(request.status === "Scheduled" || request.status === "Accepted") && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-small"
                                  onClick={() => handleUpdateProgress(request, "mentor")}
                                >
                                  Update Mentor Notes
                                </button>
                              </>
                            )}
                            {renderScheduleDetails(request)}
                            {progressFormRequestId === request._id && (
                              <div className="progress-form">
                                <label>
                                  Progress Status
                                  <select
                                    value={progressFormData.progressStatus}
                                    onChange={(e) => handleProgressFormChange("progressStatus", e.target.value)}
                                  >
                                    <option>Not Started</option>
                                    <option>In Progress</option>
                                    <option>Completed</option>
                                  </select>
                                </label>
                                <label>
                                  Notes / Resources
                                  <textarea
                                    value={progressFormData.notes}
                                    onChange={(e) => handleProgressFormChange("notes", e.target.value)}
                                    placeholder="Enter your notes or resources here"
                                  />
                                </label>
                                <div className="form-actions">
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-small"
                                    onClick={() => submitProgressUpdate(request._id)}
                                  >
                                    Save Progress
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-small"
                                    onClick={closeProgressForm}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            {scheduleFormRequestId === request._id && (
                              <div className="schedule-form">
                                <label>
                                  Date
                                  <input
                                    value={scheduleFormData.scheduledDate}
                                    onChange={(e) => handleScheduleFormChange("scheduledDate", e.target.value)}
                                  />
                                </label>
                                <label>
                                  Time
                                  <input
                                    type="time"
                                    value={scheduleFormData.scheduledTime}
                                    onChange={(e) => handleScheduleFormChange("scheduledTime", e.target.value)}
                                  />
                                </label>
                                <label>
                                  Mode
                                  <select
                                    value={scheduleFormData.meetingMode}
                                    onChange={(e) => handleScheduleFormChange("meetingMode", e.target.value)}
                                  >
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                  </select>
                                </label>
                                <label>
                                  {scheduleFormData.meetingMode === "Offline" ? "Location" : "Meeting Link"}
                                  <input
                                    type="text"
                                    value={scheduleFormData.meetingLink}
                                    onChange={(e) => handleScheduleFormChange("meetingLink", e.target.value)}
                                    placeholder={scheduleFormData.meetingMode === "Offline" ? "Enter location" : "Enter meeting link"}
                                  />
                                </label>
                                <div className="schedule-form-actions">
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleSubmitSchedule(request._id)}
                                  >
                                    Save Schedule
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-small"
                                    onClick={closeScheduleForm}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">No received requests yet.</div>
                )}
              </article>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
