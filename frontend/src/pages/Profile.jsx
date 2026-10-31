import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Image,
  Lock,
  FileText,
  Star,
  BookOpen,
  PlusCircle,
  Check,
  AlertCircle,
  X,
  Edit3,
} from "lucide-react";

function Profile() {
  const { user, updateUser } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    year: "",
    photo: "",
    experience: "",
    password: "",
  });
  const [skills, setSkills] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchProfileData = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileRes, skillsRes, reviewsRes] = await Promise.all([
          API.get("/users/profile"),
          API.get("/skills/my-skills"),
          API.get(`/reviews/mentor/${currentUserId}`).catch(() => ({ data: { reviews: [] } })),
        ]);

        const p = profileRes.data.user;
        setFormData({
          name: p.name || "",
          email: p.email || "",
          branch: p.branch || "",
          year: p.year || "",
          photo: p.photo || "",
          experience: p.experience || "",
          password: "",
        });
        setSkills(skillsRes.data.skills || []);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load student profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUserId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const body = {
        name: formData.name,
        email: formData.email,
        branch: formData.branch,
        year: formData.year,
        photo: formData.photo,
        experience: formData.experience,
      };
      if (formData.password.trim()) {
        body.password = formData.password.trim();
      }

      const res = await API.put("/users/profile", body);
      updateUser(res.data.user);
      setMessage("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="profile-page-container">
      {/* Profile Header Banner */}
      <div className="card profile-header-hero-card">
        <div className="profile-hero-banner-strip" />
        <div className="profile-hero-content-wrap">
          <div className="profile-hero-avatar-box">
            {formData.photo ? (
              <img src={formData.photo} alt={formData.name} className="profile-hero-avatar" />
            ) : (
              <div className="profile-hero-avatar-fallback">{getInitials(formData.name)}</div>
            )}
          </div>
          <div className="profile-hero-text">
            <div className="profile-hero-title-row">
              <h1 className="profile-hero-name">{formData.name || "Student Profile"}</h1>
              <span className="badge badge-primary">
                <GraduationCap size={13} />
                {formData.branch || "College Student"} {formData.year ? `· Year ${formData.year}` : ""}
              </span>
            </div>
            <p className="profile-hero-email">{formData.email}</p>
            {formData.experience && (
              <p className="profile-hero-bio">"{formData.experience}"</p>
            )}
          </div>

          <div className="profile-hero-stats-box">
            <div className="hero-stat-pill">
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <div>
                <strong>{avgRating} / 5</strong>
                <small>{reviews.length} reviews</small>
              </div>
            </div>
            <div className="hero-stat-pill">
              <BookOpen size={15} style={{ color: "var(--primary-600)" }} />
              <div>
                <strong>{skills.length}</strong>
                <small>Skills listed</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      {message && (
        <div className="alert alert-success">
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} style={{ marginLeft: "auto" }}>
            <X size={15} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading student profile...</p>
        </div>
      ) : (
        <div className="profile-2col-grid">
          {/* Left Column: Edit Profile Form */}
          <section className="card profile-edit-card">
            <div className="card-header-styled">
              <h2 className="section-card-title">Edit Profile Information</h2>
              <p className="section-card-desc">Update your academic credentials and peer mentor bio.</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form-body">
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Ariz Khan"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={14} /> College Email Address
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="name@college.edu"
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">
                    <GraduationCap size={14} /> Branch / Major
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.branch}
                    onChange={(e) => handleChange("branch", e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} /> Year of Study
                  </label>
                  <select
                    className="select-field"
                    value={formData.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Image size={14} /> Profile Photo URL
                </label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.photo}
                  onChange={(e) => handleChange("photo", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <small className="form-hint">Paste a link to your student avatar or profile image.</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FileText size={14} /> Teaching Experience & Bio
                </label>
                <textarea
                  rows={4}
                  className="textarea-field"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  placeholder="Describe your subject interests, past project mentoring, lab teaching, or study groups you run..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock size={14} /> Change Password (Optional)
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Leave empty to keep existing password"
                />
              </div>

              <div className="form-actions-right">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Check size={16} />
                  <span>{saving ? "Saving Changes..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Right Column: Skills & Feedback */}
          <div className="profile-side-col">
            {/* Skills Offered Card */}
            <div className="card profile-skills-card">
              <div className="card-header-between">
                <div>
                  <h3 className="section-card-title">My Offered Skills</h3>
                  <p className="section-card-desc">Subjects and topics you currently teach on campus.</p>
                </div>
                <Link to="/add-skill" className="btn btn-secondary btn-small">
                  <PlusCircle size={14} />
                  <span>Add Skill</span>
                </Link>
              </div>

              <div className="profile-skills-list">
                {skills.length > 0 ? (
                  skills.map((s) => (
                    <div key={s._id} className="profile-skill-row-item">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <strong>{s.title}</strong>
                          <span className="badge badge-primary">{s.category}</span>
                        </div>
                        <small style={{ color: "var(--slate-500)" }}>Mode: {s.mode}</small>
                      </div>
                      <Link to={`/skills/edit/${s._id}`} className="btn btn-secondary btn-small">
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                    <p>You haven't listed any skills yet.</p>
                    <Link to="/add-skill" className="btn btn-primary btn-small" style={{ marginTop: "0.5rem" }}>
                      Offer a Skill
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Card */}
            <div className="card profile-reviews-card">
              <div className="card-header-styled">
                <h3 className="section-card-title">Learner Reviews & Ratings</h3>
                <p className="section-card-desc">Feedback left by classmates after completed sessions.</p>
              </div>

              <div className="profile-reviews-list">
                {reviews.length > 0 ? (
                  reviews.map((r, i) => (
                    <div key={r._id || i} className="profile-review-card-item">
                      <div className="review-item-header">
                        <div className="review-author-meta">
                          <strong>{r.learner?.name || "Fellow Student"}</strong>
                          <span className="review-skill-name">
                            {r.skill?.title ? `on ${r.skill.title}` : ""}
                          </span>
                        </div>
                        <div className="review-stars-badge">
                          <Star size={13} fill="#f59e0b" color="#f59e0b" />
                          <span>{r.rating} / 5</span>
                        </div>
                      </div>
                      {r.comment && <p className="review-comment-body">"{r.comment}"</p>}
                    </div>
                  ))
                ) : (
                  <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                    <p>No reviews received yet. Complete sessions to collect student feedback!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
