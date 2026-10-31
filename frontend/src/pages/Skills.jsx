import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api/api";
import SkillCard from "../components/SkillCard";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  SlidersHorizontal,
  PlusCircle,
  X,
  Send,
  AlertCircle,
  Check,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const categories = [
  "All",
  "Programming",
  "Web Development",
  "Design",
  "Academics",
  "Communication",
  "Other",
];

const modes = ["All", "Online", "Offline", "Both"];

function Skills() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";

  const [skills, setSkills] = useState([]);
  const [mode, setMode] = useState("All");
  const [sort, setSort] = useState("newest"); // 'newest' | 'rating' | 'popular'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Request Modal State
  const [activeRequestSkill, setActiveRequestSkill] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (search) params.search = search;
        if (category && category !== "All") params.category = category;
        if (mode && mode !== "All") params.mode = mode;
        if (sort) params.sort = sort;

        const query = new URLSearchParams(params).toString();
        const response = await API.get(`/skills${query ? `?${query}` : ""}`);
        setSkills(response.data.skills || []);
      } catch (err) {
        setError(err.response?.data?.error || "Unable to fetch skills.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSkills();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, category, mode, sort]);

  const handleSearchChange = (val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set("search", val);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (selectedCat) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", selectedCat);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setMode("All");
    setSort("newest");
    setSearchParams({});
  };

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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequestSkill) return;

    setSubmittingRequest(true);
    try {
      await API.post("/requests", {
        skillId: activeRequestSkill._id,
        message: requestMessage,
      });
      setSuccessMessage(`Session request sent to ${activeRequestSkill.offeredBy?.name || "the instructor"}!`);
      setTimeout(() => setSuccessMessage(""), 4000);
      closeRequestForm();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send request.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const hasActiveFilters = search || category !== "All" || mode !== "All" || sort !== "newest";

  return (
    <div className="skills-page-container">
      {/* Header Banner */}
      <div className="marketplace-header-card">
        <div className="marketplace-header-text">
          <div className="badge badge-primary" style={{ width: "fit-content", marginBottom: "0.5rem" }}>
            <Sparkles size={13} />
            <span>Campus Skill Exchange Marketplace</span>
          </div>
          <h1 className="marketplace-title">Peer-to-Peer Learning Marketplace</h1>
          <p className="marketplace-subtitle">
            Discover fellow students offering practical tutorials, coding mentorship, design critiques,
            and exam review sessions.
          </p>
        </div>
        <div className="marketplace-header-action">
          <Link to="/add-skill" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Offer a Skill</span>
          </Link>
        </div>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} style={{ marginLeft: "auto" }}>
            <X size={15} />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card marketplace-filter-card">
        <div className="filter-search-row">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon-inside" />
            <input
              type="search"
              className="input-field search-input-with-icon"
              placeholder="Search by topic, concept, framework, or skill name..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-selects-group">
            <div className="select-wrap">
              <label className="select-tiny-label">Delivery Mode</label>
              <select
                className="select-field"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                {modes.map((m) => (
                  <option key={m} value={m}>
                    {m === "All" ? "Any Mode" : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-wrap">
              <label className="select-tiny-label">Sort By</label>
              <select
                className="select-field"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Requested</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary btn-small reset-filters-btn"
                onClick={resetFilters}
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="category-pills-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill-btn ${category === cat ? "active" : ""}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid Section */}
      <div className="marketplace-results-section">
        <div className="results-count-bar">
          <span>
            Showing <strong>{skills.length}</strong> {skills.length === 1 ? "available skill" : "available skills"}
          </span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Searching student skill listings...</p>
          </div>
        ) : skills.length > 0 ? (
          <div className="skills-catalog-grid">
            {skills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                onRequest={openRequestForm}
                isOwner={skill.offeredBy?._id === (user?._id || user?.id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SlidersHorizontal size={24} />
            </div>
            <h3 className="empty-state-title">No matching skills found</h3>
            <p className="empty-state-desc">
              Try adjusting your search terms, selecting a different category, or clearing the delivery mode filter.
            </p>
            {hasActiveFilters && (
              <button type="button" className="btn btn-secondary btn-small" onClick={resetFilters}>
                <RotateCcw size={14} />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Request Modal */}
      {activeRequestSkill && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Request Session</h3>
              <button type="button" className="btn-icon" onClick={closeRequestForm}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="modal-body">
                <div className="request-modal-skill-summary">
                  <span className="badge badge-primary">{activeRequestSkill.category}</span>
                  <h4 style={{ margin: "0.4rem 0 0.2rem", fontSize: "1.05rem" }}>
                    {activeRequestSkill.title}
                  </h4>
                  <p style={{ color: "var(--slate-500)", fontSize: "0.85rem", margin: 0 }}>
                    Instructor: <strong>{activeRequestSkill.offeredBy?.name || "Peer Mentor"}</strong> ·{" "}
                    Mode: {activeRequestSkill.mode}
                  </p>
                </div>

                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label">
                    Message to Instructor
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="textarea-field"
                    placeholder="Introduce yourself and explain what you want to learn (e.g. 'I am working on an assignment with recursion and need help debugging my base cases')..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={closeRequestForm}
                  disabled={submittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-small"
                  disabled={submittingRequest}
                >
                  <Send size={14} />
                  <span>{submittingRequest ? "Sending..." : "Send Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Skills;
