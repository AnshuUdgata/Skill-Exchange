import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const nextErrors = {};
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (!formData.password.trim()) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Login</h1>
        <p>Sign in to access your campus skills dashboard.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="form-group">
            <span>Email</span>
            <input
              className="input-field"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </label>

          <label className="form-group">
            <span>Password</span>
            <input
              className="input-field"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </label>

          {serverError && <div className="error-text">{serverError}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
