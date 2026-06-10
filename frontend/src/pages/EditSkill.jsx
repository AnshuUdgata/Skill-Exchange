import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

function EditSkill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "Programming",
    description: "",
    mode: "Online",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSkill = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await API.get(`/skills/${id}`);
        const skill = response.data.skill;
        setFormData({
          title: skill.title,
          category: skill.category,
          description: skill.description,
          mode: skill.mode,
        });
      } catch (err) {
        setError(err.response?.data?.error || "Could not load skill.");
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [id]);

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

    setSaving(true);
    try {
      await API.put(`/skills/${id}`, formData);
      setSuccess("Skill updated successfully.");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update skill.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="empty-state">Loading skill details...</div>;
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Edit Skill</h1>
        <p>Update the skill details you are offering.</p>

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

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Updating..." : "Update Skill"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditSkill;
