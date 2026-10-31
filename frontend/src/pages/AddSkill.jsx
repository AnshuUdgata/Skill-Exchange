import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import {
  BookOpen,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

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

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please provide a title and a detailed description.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/skills", formData);
      setSuccess("Skill published successfully! Redirecting to marketplace...");
      setTimeout(() => navigate("/skills"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to add skill.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page-container">
      <div style={{ marginBottom: "1rem" }}>
        <Link to="/skills" className="btn btn-secondary btn-small">
          <ArrowLeft size={14} />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="card form-sheet-card">
        <div className="form-sheet-header">
          <div className="form-sheet-icon-wrap">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="form-sheet-title">Offer a Skill on Campus</h1>
            <p className="form-sheet-desc">
              List a topic you can teach or mentor fellow students in, from algorithms to design or course prep.
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
            <label className="form-label">
              Skill Title <span style={{ color: "var(--rose-500)" }}>*</span>
            </label>
            <input
              type="text"
              required
              name="title"
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Intro to React & Hooks, or Calculus II Midterm Prep"
            />
            <small className="form-hint">Make it specific and clear so classmates know exactly what they will learn.</small>
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
                <option value="Online">Online (Google Meet, Zoom)</option>
                <option value="Offline">Offline (Campus Study Rooms, Labs)</option>
                <option value="Both">Both (Flexible)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Description & Learning Goals <span style={{ color: "var(--rose-500)" }}>*</span>
            </label>
            <textarea
              name="description"
              required
              rows={5}
              className="textarea-field"
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline what you will cover, prerequisites, and what kind of exercises or projects you will do together..."
            />
          </div>

          <div className="form-actions-footer">
            <Link to="/skills" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Sparkles size={16} />
              <span>{loading ? "Publishing..." : "Publish Skill"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSkill;
