import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    branch: "",
    year: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "Full name is required.";
    if (!formData.email.trim()) nextErrors.email = "College email is required.";
    if (!formData.password.trim()) nextErrors.password = "Password is required.";
    if (formData.password.length > 0 && formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    if (!formData.branch.trim()) nextErrors.branch = "Branch / Major is required.";
    if (!formData.year.trim()) nextErrors.year = "Year of study is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await API.post("/auth/register", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card card">
        {/* Left Side: Campus Branding */}
        <div className="auth-brand-side">
          <div className="auth-brand-header">
            <div className="brand-icon-wrapper" style={{ width: 36, height: 36 }}>
              <GraduationCap size={20} />
            </div>
            <span className="brand-title" style={{ color: "#ffffff", fontSize: "1.2rem" }}>
              CampusSkill
            </span>
          </div>

          <div className="auth-brand-content">
            <h2 className="auth-brand-heading">
              Join your campus skill community.
            </h2>
            <p className="auth-brand-subtext">
              Share what you know with fellow students, request 1-on-1 sessions to master
              difficult coursework, and build your reputation on campus.
            </p>

            <div className="auth-perks-list">
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Offer skills in coding, design, or academics</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Earn peer reviews and instructor badges</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>100% free and peer-driven</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <p>© {new Date().getFullYear()} Campus Skill Exchange. For student learning.</p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <h1 className="auth-title">Create Student Account</h1>
            <p className="auth-desc">Fill in your campus details to start trading skills.</p>
          </div>

          {serverError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form-body">
            <div className="form-group">
              <label className="form-label">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                name="name"
                className={`input-field ${errors.name ? "input-error" : ""}`}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Ariz Khan"
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={14} /> College Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="name@college.edu"
              />
              {errors.email && <span className="field-error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={14} /> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`input-field ${errors.password ? "input-error" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="field-error-text">{errors.password}</span>}
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">
                  <GraduationCap size={14} /> Branch / Major
                </label>
                <input
                  type="text"
                  name="branch"
                  className={`input-field ${errors.branch ? "input-error" : ""}`}
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                />
                {errors.branch && <span className="field-error-text">{errors.branch}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} /> Year of Study
                </label>
                <select
                  name="year"
                  className={`select-field ${errors.year ? "input-error" : ""}`}
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="">Select year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                {errors.year && <span className="field-error-text">{errors.year}</span>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-large btn-block" disabled={loading}>
              <Sparkles size={16} />
              <span>{loading ? "Creating Account..." : "Create Free Account"}</span>
            </button>
          </form>

          <div className="auth-switch-box">
            <p>
              Already registered?{" "}
              <Link to="/login" className="auth-switch-link">
                Sign in to your account <ArrowRight size={13} style={{ display: "inline" }} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
