import { Link } from "react-router-dom";

function SkillCard({ skill, onRequest, isOwner }) {
  const ownerName = skill.offeredBy?.name || skill.offeredBy || "Unknown";

  return (
    <article className="skill-card">
      <div className="skill-card-header">
        <h3>{skill.title}</h3>
        <span className="skill-badge">{skill.category}</span>
      </div>
      <p>{skill.description}</p>
      <div className="skill-card-meta">
        <span>{skill.mode}</span>
        <span>
          Offered by {skill.offeredBy?._id ? (
            <Link className="skill-instructor-link" to={`/instructor/${skill.offeredBy._id}`}>
              {ownerName}
            </Link>
          ) : (
            ownerName
          )}
        </span>
        <div className="skill-rating">
          <strong>{skill.avgRating ? skill.avgRating.toFixed(1) : "—"}</strong>
          <span>({skill.reviewsCount || 0})</span>
        </div>
      </div>
      <div className="skill-card-actions">
        {isOwner ? (
          <span className="skill-owner-label">Your Skill</span>
        ) : (
          onRequest && (
            <button type="button" className="btn btn-secondary btn-small" onClick={() => onRequest(skill)}>
              Request Session
            </button>
          )
        )}
      </div>
    </article>
  );
}

export default SkillCard;
