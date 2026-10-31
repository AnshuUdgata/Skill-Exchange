import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";
import {
  GraduationCap,
  Mail,
  Star,
  BookOpen,
  ArrowLeft,
  AlertCircle,
  Video,
  MapPin,
  Globe,
} from "lucide-react";

function Instructor() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstructor = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await API.get(`/users/${id}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load student instructor profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstructor();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case "Online":
        return <Video size={13} />;
      case "Offline":
        return <MapPin size={13} />;
      default:
        return <Globe size={13} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
        <p>Loading instructor profile...</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="profile-page-container">
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error || "Instructor profile not found."}</span>
        </div>
        <Link to="/skills" className="btn btn-secondary btn-small">
          <ArrowLeft size={14} />
          <span>Back to Skills Marketplace</span>
        </Link>
      </div>
    );
  }

  const { instructor: u, overallRating, totalReviews, skills } = data;

  return (
    <div className="profile-page-container">
      {/* Back button */}
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/skills" className="btn btn-secondary btn-small">
          <ArrowLeft size={14} />
          <span>Back to Skills</span>
        </Link>
      </div>

      {/* Instructor Banner Card */}
      <div className="card profile-header-hero-card">
        <div className="profile-hero-banner-strip" />
        <div className="profile-hero-content-wrap">
          <div className="profile-hero-avatar-box">
            {u.photo ? (
              <img src={u.photo} alt={u.name} className="profile-hero-avatar" />
            ) : (
              <div className="profile-hero-avatar-fallback">{getInitials(u.name)}</div>
            )}
          </div>

          <div className="profile-hero-text">
            <div className="profile-hero-title-row">
              <h1 className="profile-hero-name">{u.name}</h1>
              <span className="badge badge-primary">
                <GraduationCap size={13} />
                {u.branch} {u.year ? `· Year ${u.year}` : ""}
              </span>
            </div>
            <p className="profile-hero-email">
              <Mail size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
              {u.email}
            </p>
            {u.experience && (
              <p className="profile-hero-bio">"{u.experience}"</p>
            )}
          </div>

          <div className="profile-hero-stats-box">
            <div className="hero-stat-pill">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <div>
                <strong>{overallRating ? Number(overallRating).toFixed(1) : "New"} / 5</strong>
                <small>{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</small>
              </div>
            </div>
            <div className="hero-stat-pill">
              <BookOpen size={16} style={{ color: "var(--primary-600)" }} />
              <div>
                <strong>{skills.length}</strong>
                <small>{skills.length === 1 ? "Skill taught" : "Skills taught"}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Offered By Instructor */}
      <div className="card profile-content-section-card">
        <div className="card-header-styled">
          <h2 className="section-card-title">Skills Offered by {u.name}</h2>
          <p className="section-card-desc">
            Browse skills taught by this mentor. Request a session directly through the marketplace.
          </p>
        </div>

        {skills.length > 0 ? (
          <div className="skills-catalog-grid" style={{ marginTop: "1.25rem" }}>
            {skills.map((skill) => (
              <div key={skill._id} className="card skill-card-modern">
                <div className="skill-card-top-row">
                  <span className="badge badge-primary">{skill.category}</span>
                  <span className="badge badge-neutral skill-mode-badge">
                    {getModeIcon(skill.mode)}
                    <span>{skill.mode}</span>
                  </span>
                </div>
                <div className="skill-card-body-content">
                  <h3 className="skill-card-title">{skill.title}</h3>
                </div>
                <div className="skill-card-footer-info" style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                  <div className="skill-rating-inline">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <strong>{skill.avgRating ? Number(skill.avgRating).toFixed(1) : "—"} / 5</strong>
                    <span className="reviews-count-muted">
                      ({skill.reviewsCount || 0} {skill.reviewsCount === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                  <Link
                    to={`/skills?search=${encodeURIComponent(skill.title)}`}
                    className="btn btn-primary btn-small"
                  >
                    <span>Request Session</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>This instructor has not published any skills yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Instructor;
