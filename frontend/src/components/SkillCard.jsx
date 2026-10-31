import { Link } from "react-router-dom";
import { Star, Video, MapPin, Globe, Send, Edit3 } from "lucide-react";

function SkillCard({ skill, onRequest, isOwner }) {
  const owner = skill.offeredBy;
  const ownerName = owner?.name || (typeof owner === "string" ? owner : "Campus Instructor");
  const ownerId = owner?._id;

  const getCategoryClass = (category) => {
    switch (category) {
      case "Programming":
        return "badge-primary";
      case "Web Development":
        return "badge-primary";
      case "Design":
        return "badge-violet";
      case "Academics":
        return "badge-warning";
      case "Communication":
        return "badge-success";
      default:
        return "badge-neutral";
    }
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

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <article className="card skill-card-modern card-interactive">
      <div className="skill-card-top-row">
        <span className={`badge ${getCategoryClass(skill.category)}`}>
          {skill.category}
        </span>
        <span className="badge badge-neutral skill-mode-badge">
          {getModeIcon(skill.mode)}
          <span>{skill.mode}</span>
        </span>
      </div>

      <div className="skill-card-body-content">
        <h3 className="skill-card-title">{skill.title}</h3>
        <p className="skill-card-desc">{skill.description}</p>
      </div>

      <div className="skill-card-footer-info">
        <div className="skill-card-author-group">
          {owner?.photo ? (
            <img src={owner.photo} alt={ownerName} className="skill-author-avatar" />
          ) : (
            <div className="skill-author-avatar-fallback">
              {getInitials(ownerName)}
            </div>
          )}
          <div className="skill-author-meta">
            {ownerId ? (
              <Link to={`/instructor/${ownerId}`} className="skill-author-name-link">
                {ownerName}
              </Link>
            ) : (
              <span className="skill-author-name">{ownerName}</span>
            )}
            <div className="skill-rating-inline">
              <Star size={13} className="star-icon-filled" />
              <strong>{skill.avgRating ? Number(skill.avgRating).toFixed(1) : "New"}</strong>
              <span className="reviews-count-muted">
                ({skill.reviewsCount || 0} {skill.reviewsCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        </div>

        <div className="skill-card-action-box">
          {isOwner ? (
            <Link to={`/skills/edit/${skill._id}`} className="btn btn-secondary btn-small">
              <Edit3 size={14} />
              <span>Edit Skill</span>
            </Link>
          ) : (
            onRequest && (
              <button
                type="button"
                className="btn btn-primary btn-small"
                onClick={() => onRequest(skill)}
              >
                <Send size={13} />
                <span>Request</span>
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export default SkillCard;
