import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function Instructor() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInstructor = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await API.get(`/users/${id}`);
        setInstructor(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load instructor.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstructor();
  }, [id]);

  if (loading) {
    return <div className="empty-state">Loading instructor profile...</div>;
  }

  if (error) {
    return <div className="error-text">{error}</div>;
  }

  if (!instructor?.success) {
    return <div className="empty-state">Instructor not found.</div>;
  }

  const { instructor: user, overallRating, totalReviews, skills } = instructor;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>{user.name}</h1>
        <p>Instructor profile and ratings for all skills.</p>
      </div>

      <section className="profile-section instructor-hero">
        <div className="profile-info-card">
          <div className="profile-card-top">
            <img
              className="profile-photo"
              src={user.photo || "https://via.placeholder.com/120?text=Profile"}
              alt={user.name}
            />
            <div>
              <h2>{user.name}</h2>
              <p>{user.experience || "No experience details provided yet."}</p>
            </div>
          </div>
          <div className="profile-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="profile-row">
            <span>Branch</span>
            <strong>{user.branch}</strong>
          </div>
          <div className="profile-row">
            <span>Year</span>
            <strong>{user.year}</strong>
          </div>
          <div className="profile-row">
            <span>Overall Rating</span>
            <strong>{overallRating ? overallRating.toFixed(1) : "—"} / 5</strong>
          </div>
          <div className="profile-row">
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="section-heading">
          <p>Skill ratings</p>
          <h2>Average rating for each skill taught.</h2>
        </div>
        <div className="review-list">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div key={skill._id} className="review-card">
                <div className="review-header">
                  <strong>{skill.title}</strong>
                  <span>{skill.avgRating ? skill.avgRating.toFixed(1) : "—"} / 5</span>
                </div>
                <p>{skill.category} · {skill.mode} · {skill.reviewsCount} reviews</p>
              </div>
            ))
          ) : (
            <div className="empty-state">This instructor has not published any skills yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Instructor;
