import { Link } from "react-router-dom";
import { GraduationCap, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <div className="brand-icon-wrapper" style={{ width: 28, height: 28 }}>
                <GraduationCap size={16} />
              </div>
              <span className="brand-title" style={{ fontSize: "1rem" }}>
                CampusSkill Exchange
              </span>
            </div>
            <p className="footer-tagline">
              A collaborative peer-learning network designed for college students to share expertise,
              book mentor sessions, and grow together.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4>Platform</h4>
              <Link to="/skills">Explore Skills</Link>
              <Link to="/add-skill">Offer a Skill</Link>
              <Link to="/dashboard">Student Dashboard</Link>
            </div>
            <div className="footer-links-col">
              <h4>Community</h4>
              <Link to="/skills?category=Programming">Coding & Tech</Link>
              <Link to="/skills?category=Design">Design & Media</Link>
              <Link to="/skills?category=Academics">Academics</Link>
            </div>
            <div className="footer-links-col">
              <h4>Account</h4>
              <Link to="/profile">My Profile</Link>
              <Link to="/notifications">Notifications</Link>
              <Link to="/login">Student Login</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Campus Skill Exchange. Built for students with passion.</p>
          <div className="footer-badge-made">
            <span>Powered by peer-to-peer knowledge</span>
            <Heart size={13} className="heart-icon" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
