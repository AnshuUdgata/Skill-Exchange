import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import API from "../api/api";
import {
  Edit3,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

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
        setError(err.response?.data?.error || "Could not load skill details.");
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

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please provide a title and description.");
      return;
    }

    setSaving(true);
    try {
      await API.put(`/skills/${id}`, formData);
      setSuccess("Skill updated successfully! Returning to dashboard...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update skill.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: "50vh" }}>
        <div className="spinner" />
        <p>Loading skill details...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/dashboard" className="btn btn-secondary btn-small">
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="card form-sheet-card">
        <div className="form-sheet-header">
          <div className="form-sheet-icon-wrap">
            <Edit3 size={24} />
          </div>
          <div>
            <h1 className="form-sheet-title">Edit Skill Details</h1>
            <p className="form-sheet-desc">
              Update the syllabus, delivery mode, or category of this offering.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-sheet-body">
          <div className="form-group">
            <label className="form-label">Skill Title</label>
            <input
              type="text"
              required
              name="title"
              className="input-field"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="select-field"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Design">Design</option>
                <option value="Academics">Academics</option>
                <option value="Communication">Communication</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teaching Mode</label>
              <select
                name="mode"
                className="select-field"
                value={formData.mode}
                onChange={handleChange}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Syllabus</label>
            <textarea
              name="description"
              required
              rows={5}
              className="textarea-field"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions-footer">
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Sparkles size={16} />
              <span>{saving ? "Updating..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSkill;
