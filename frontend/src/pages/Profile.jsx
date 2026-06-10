import { useEffect, useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateUser } = useAuth();
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

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileRes, skillsRes, reviewsRes] = await Promise.all([
          API.get("/users/profile"),
          API.get("/skills/my-skills"),
          API.get(`/reviews/mentor/${user.id}`),
        ]);

        const profile = profileRes.data.user;
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          branch: profile.branch || "",
          year: profile.year || "",
          photo: profile.photo || "",
          experience: profile.experience || "",
          password: "",
        });
        setSkills(skillsRes.data.skills || []);
        setReviews(reviewsRes.data.reviews || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const body = {
        name: formData.name,
        email: formData.email,
        branch: formData.branch,
        year: formData.year,
        photo: formData.photo,
        experience: formData.experience,
      };
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await API.put("/users/profile", body);
      updateUser(res.data.user);
      setMessage("Profile updated successfully.");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update profile.");
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="page-header">
          <h1>Profile</h1>
          <p>Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Update your profile, experience, and account settings here.</p>
      </div>

      {message && <div className="success-text">{message}</div>}
      {error && <div className="error-text">{error}</div>}

      <section className="profile-section">
        <div className="profile-info-card">
          <h2>Profile settings</h2>
          <form onSubmit={handleSubmit} className="form-card">
            <label>
              Profile photo URL
              <input
                className="input-field"
                type="text"
                value={formData.photo}
                onChange={(e) => handleChange("photo", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </label>
            <label>
              Name
              <input
                className="input-field"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </label>
            <label>
              Email
              <input
                className="input-field"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </label>
            <label>
              Branch
              <input
                className="input-field"
                type="text"
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
              />
            </label>
            <label>
              Year
              <input
                className="input-field"
                type="text"
                value={formData.year}
                onChange={(e) => handleChange("year", e.target.value)}
              />
            </label>
            <label>
              Experience
              <textarea
                className="input-field"
                rows="4"
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                placeholder="Share your teaching experience and topics you specialize in."
              />
            </label>
            <label>
              New password (optional)
              <input
                className="input-field"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="profile-section">
        <div className="section-heading">
          <p>Skills Offered</p>
          <h2>Your teaching profile.</h2>
        </div>
        <div className="review-list">
          {loading ? (
            <div className="empty-state">Loading skills...</div>
          ) : skills.length > 0 ? (
            skills.map((skill) => (
              <div key={skill._id} className="review-card">
                <div className="review-header">
                  <strong>{skill.title}</strong>
                  <span>{skill.mode}</span>
                </div>
                <p>{skill.category}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">You have not added any skills yet.</div>
          )}
        </div>
      </section>

      <section className="profile-section">
        <div className="section-heading">
          <p>Reviews</p>
          <h2>Feedback from learners.</h2>
        </div>
        <div className="review-list">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id || review.learner?.name} className="review-card">
                <div className="review-header">
                  <strong>{review.learner?.name || "Learner"}</strong>
                  <span>{review.rating} / 5</span>
                </div>
                <p>{review.comment || "No comment provided."}</p>
              </div>
            ))
          ) : (
            <div className="empty-state">No reviews available yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Profile;
