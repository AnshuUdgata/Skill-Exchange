import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function AddSkill() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "Programming",
    description: "",
    mode: "Online",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title || !formData.description) {
      setError("Please enter title and description.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/skills", formData);
      setSuccess("Skill added successfully.");
      setFormData({ title: "", category: "Programming", description: "", mode: "Online" });
      setTimeout(() => navigate("/skills"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to add skill.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Add Skill</h1>
        <p>Share a skill you can teach and let learners request a session.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="form-group">
            <span>Title</span>
            <input
              className="input-field"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Skill title"
            />
          </label>

          <label className="form-group">
            <span>Category</span>
            <select
              className="select-field"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Academics">Academics</option>
              <option value="Communication">Communication</option>
              <option value="Web Development">Web Development</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="form-group">
            <span>Description</span>
            <textarea
              className="input-field"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe the skill and what you can teach"
            />
          </label>

          <label className="form-group">
            <span>Mode</span>
            <select
              className="select-field"
              name="mode"
              value={formData.mode}
              onChange={handleChange}
            >
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Both">Both</option>
            </select>
          </label>

          {error && <div className="error-text">{error}</div>}
          {success && <div className="success-text">{success}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Adding skill..." : "Add Skill"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddSkill;
