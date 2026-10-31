import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import {
  GraduationCap,
  Search,
  LayoutDashboard,
  Compass,
  Bell,
  PlusCircle,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      if (!isAuthenticated) {
        setUnread(0);
        return;
      }
      try {
        const res = await API.get("/notifications");
        const list = res.data.notifications || [];
        setUnread(list.filter((n) => !n.isRead).length);
      } catch {
        setUnread(0);
      }
    };
    fetchUnread();
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/skills?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <NavLink to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <GraduationCap className="brand-icon" size={22} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">CampusSkill</span>
            <span className="brand-badge">Exchange</span>
          </div>
        </NavLink>

        {/* Global Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <Search className="search-icon" size={16} />
          <input
            type="search"
            placeholder="Search skills, topics, or mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search-input"
            aria-label="Search skills"
          />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="navbar-desktop-nav" onClick={closeMenus} aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Compass size={17} />
            <span>Home</span>
          </NavLink>

          <NavLink to="/skills" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Sparkles size={17} />
            <span>Skills</span>
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <div className="nav-icon-wrapper">
                  <Bell size={17} />
                  {unread > 0 && <span className="notif-badge-pill">{unread > 9 ? "9+" : unread}</span>}
                </div>
                <span>Alerts</span>
              </NavLink>

              <NavLink to="/add-skill" className="btn btn-primary btn-small btn-add-skill">
                <PlusCircle size={15} />
                <span>Offer Skill</span>
              </NavLink>

              {/* User Dropdown */}
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-menu-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-label="User menu"
                >
                  {user?.photo ? (
                    <img src={user.photo} alt={user.name || "User"} className="nav-avatar-img" />
                  ) : (
                    <div className="nav-avatar-placeholder">{getInitials(user?.name)}</div>
                  )}
                  <span className="nav-user-name">{user?.name?.split(" ")[0] || "Account"}</span>
                  <ChevronDown size={14} className={`chevron-icon ${userDropdownOpen ? "rotated" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-dropdown-info">
                        <strong>{user?.name}</strong>
                        <p>{user?.email}</p>
                        {user?.branch && (
                          <span className="badge badge-primary user-dropdown-badge">
                            {user.branch} {user.year ? `· Year ${user.year}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <NavLink to="/profile" className="dropdown-item">
                      <User size={15} />
                      <span>My Profile</span>
                    </NavLink>
                    <NavLink to="/dashboard" className="dropdown-item">
                      <LayoutDashboard size={15} />
                      <span>My Dashboard</span>
                    </NavLink>
                    <NavLink to="/add-skill" className="dropdown-item">
                      <PlusCircle size={15} />
                      <span>Offer a Skill</span>
                    </NavLink>
                    {user?.role === "admin" && (
                      <NavLink to="/admin" className="dropdown-item">
                        <Shield size={15} />
                        <span>Admin Insights</span>
                      </NavLink>
                    )}
                    <div className="dropdown-divider" />
                    <button type="button" className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons-group">
              <NavLink to="/login" className="btn btn-secondary btn-small">
                Log In
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-small">
                Join Free
              </NavLink>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" onClick={(e) => { if (e.target.closest("a, button")) closeMenus(); }}>
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <Search className="search-icon" size={16} />
            <input
              type="search"
              placeholder="Search skills, topics, mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
          </form>

          {isAuthenticated && user && (
            <div className="mobile-user-card">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="nav-avatar-img" />
              ) : (
                <div className="nav-avatar-placeholder">{getInitials(user.name)}</div>
              )}
              <div>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
              </div>
            </div>
          )}

          <div className="mobile-nav-links">
            <NavLink to="/" end className="mobile-nav-item">
              <Compass size={18} />
              <span>Home</span>
            </NavLink>
            <NavLink to="/skills" className="mobile-nav-item">
              <Sparkles size={18} />
              <span>Explore Skills</span>
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className="mobile-nav-item">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/notifications" className="mobile-nav-item">
                  <Bell size={18} />
                  <span>Notifications {unread > 0 && `(${unread})`}</span>
                </NavLink>
                <NavLink to="/add-skill" className="mobile-nav-item">
                  <PlusCircle size={18} />
                  <span>Offer a Skill</span>
                </NavLink>
                <NavLink to="/profile" className="mobile-nav-item">
                  <User size={18} />
                  <span>My Profile</span>
                </NavLink>
                {user?.role === "admin" && (
                  <NavLink to="/admin" className="mobile-nav-item">
                    <Shield size={18} />
                    <span>Admin Stats</span>
                  </NavLink>
                )}
                <div className="dropdown-divider" />
                <button type="button" className="mobile-nav-item mobile-logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="mobile-auth-actions">
                <NavLink to="/login" className="btn btn-secondary" style={{ width: "100%" }}>
                  Log In
                </NavLink>
                <NavLink to="/register" className="btn btn-primary" style={{ width: "100%" }}>
                  Create Account
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
