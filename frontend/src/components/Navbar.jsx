import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import API from "../api/api";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated) return setUnread(0);
      try {
        const res = await API.get("/notifications");
        const list = res.data.notifications || [];
        setUnread(list.filter((n) => !n.isRead).length);
      } catch (err) {
        setUnread(0);
      }
    };
    fetchUnread();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Campus Skill Exchange</div>
      <div className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/skills">Skills</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/notifications">Notifications{unread > 0 && <span className="notif-badge">{unread}</span>}</NavLink>
            <NavLink to="/add-skill">Add Skill</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </>
        )}
        {!isAuthenticated ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        ) : (
          <button type="button" className="btn btn-secondary btn-small" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
