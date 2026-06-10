import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import SkillCard from "../components/SkillCard";
import { useAuth } from "../context/AuthContext";

const categories = [
  "All",
  "Programming",
  "Design",
  "Academics",
  "Communication",
  "Web Development",
  "Other",
];

const modes = ["All", "Online", "Offline", "Both"];

function Skills() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeRequestSkill, setActiveRequestSkill] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (search) params.search = search;
        if (category && category !== "All") params.category = category;
        if (mode && mode !== "All") params.mode = mode;

        const query = new URLSearchParams(params).toString();
        const response = await API.get(`/skills${query ? `?${query}` : ""}`);
        setSkills(response.data.skills || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to fetch skills.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [search, category, mode]);

  const filteredSkills = skills;

  const openRequestForm = (skill) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setActiveRequestSkill(skill);
    setRequestMessage("");
    setError("");
  };

  const closeRequestForm = () => {
    setActiveRequestSkill(null);
    setRequestMessage("");
  };

  const handleRequestSubmit = async () => {
    if (!activeRequestSkill) return;

    try {
      await API.post("/requests", {
        skillId: activeRequestSkill._id,
        message: requestMessage,
      });
      setMessage("Session request sent successfully.");
      setTimeout(() => setMessage(""), 3000);
      closeRequestForm();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request.");
    }
  };

  return (
    <div className="skills-page">
      <div className="page-header">
        <h1>Skill marketplace</h1>
        <p>Search student-led sessions by category, mode, and topic.</p>
      </div>

      <div className="filter-bar">
        <label className="filter-group">
          <span>Search</span>
          <input
            className="input-field"
            type="search"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills..."
          />
        </label>

        <label className="filter-group">
          <span>Category</span>
          <select
            className="select-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-group">
          <span>Mode</span>
          <select
            className="select-field"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            {modes.map((modeOption) => (
              <option key={modeOption} value={modeOption}>
                {modeOption}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message && <div className="success-text">{message}</div>}
      {error && <div className="error-text">{error}</div>}
      {activeRequestSkill && (
        <div className="form-card request-box">
          <h2>Request session for {activeRequestSkill.title}</h2>
          <p>Send a short message to the skill owner.</p>
          <div className="form-group">
            <label htmlFor="requestMessage">Message</label>
            <textarea
              id="requestMessage"
              className="input-field"
              rows="4"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Describe what you want to learn..."
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleRequestSubmit}>
              Send Request
            </button>
            <button type="button" className="btn btn-secondary" onClick={closeRequestForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading skills...</div>
      ) : filteredSkills.length > 0 ? (
        <div className="skill-grid">
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              onRequest={openRequestForm}
              isOwner={skill.offeredBy?._id === user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">No skills found. Try a different filter.</div>
      )}
    </div>
  );
}

export default Skills;
