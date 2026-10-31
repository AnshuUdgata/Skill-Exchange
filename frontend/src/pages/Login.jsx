import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (!formData.password.trim()) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.response?.data?.error || "Login failed. Please verify your credentials.");
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
              Welcome back to your campus peer network.
            </h2>
            <p className="auth-brand-subtext">
              Log in to check pending requests, manage scheduled mentor sessions,
              and explore new skills shared by your college peers.
            </p>

            <div className="auth-perks-list">
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Track 1-on-1 scheduled sessions</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Real-time mentor review scores</span>
              </div>
              <div className="auth-perk-item">
                <CheckCircle2 size={16} />
                <span>Direct student-to-student messaging</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <p>© {new Date().getFullYear()} Campus Skill Exchange. For student learning.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="auth-form-side">
          <div className="auth-form-header">
            <h1 className="auth-title">Student Sign In</h1>
            <p className="auth-desc">Enter your college credentials to access your dashboard.</p>
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
                <Mail size={14} /> College Email Address
              </label>
              <input
                type="email"
                name="email"
                className={`input-field ${errors.email ? "input-error" : ""}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@college.edu"
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
                  placeholder="Enter your password"
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

            <button type="submit" className="btn btn-primary btn-large btn-block" disabled={loading}>
              <Sparkles size={16} />
              <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>
            </button>
          </form>

          <div className="auth-switch-box">
            <p>
              New to Campus Skill Exchange?{" "}
              <Link to="/register" className="auth-switch-link">
                Create free account <ArrowRight size={13} style={{ display: "inline" }} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
