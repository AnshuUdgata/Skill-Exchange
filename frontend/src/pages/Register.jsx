import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

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
    if (!formData.name.trim()) nextErrors.name = "Name is required.";
    if (!formData.email.trim()) nextErrors.email = "Email is required.";
    if (!formData.password.trim()) nextErrors.password = "Password is required.";
    if (!formData.branch.trim()) nextErrors.branch = "Branch is required.";
    if (!formData.year.trim()) nextErrors.year = "Year is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/register", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      setServerError(error.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Register</h1>
        <p>Create your account to start teaching and learning on campus.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label className="form-group">
            <span>Name</span>
            <input
              className="input-field"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </label>

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
              placeholder="Choose a password"
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </label>

          <label className="form-group">
            <span>Branch</span>
            <input
              className="input-field"
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Example: Computer Science"
            />
            {errors.branch && <div className="error-text">{errors.branch}</div>}
          </label>

          <label className="form-group">
            <span>Year</span>
            <select
              className="select-field"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            {errors.year && <div className="error-text">{errors.year}</div>}
          </label>

          {serverError && <div className="error-text">{serverError}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
