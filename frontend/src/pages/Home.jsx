import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";
import {
  Code,
  Palette,
  BookOpen,
  MessageCircle,
  Globe,
  MoreHorizontal,
  Search,
  CheckCircle2,
  Calendar,
  Star,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const categoryList = [
  { name: "Programming", icon: Code, desc: "Python, C++, Java, Data Structures" },
  { name: "Web Development", icon: Globe, desc: "React, Node.js, Next.js, APIs" },
  { name: "Design", icon: Palette, desc: "Figma, UI/UX, Graphic Design, 3D" },
  { name: "Academics", icon: BookOpen, desc: "Calculus, Physics, Algorithms, AI" },
  { name: "Communication", icon: MessageCircle, desc: "Interview prep, Public speaking, Debating" },
  { name: "Other", icon: MoreHorizontal, desc: "Music, Video Editing, Photography" },
];

const steps = [
  {
    step: "01",
    title: "Discover Peer Mentors",
    description: "Search student-led skills across departments by topic, category, or rating.",
    icon: Search,
  },
  {
    step: "02",
    title: "Request a Session",
    description: "Send a session request with notes on what you want to learn or troubleshoot.",
    icon: Calendar,
  },
  {
    step: "03",
    title: "Learn & Collaborate",
    description: "Connect via Google Meet or on campus in the library to learn 1-on-1.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Review & Build Credibility",
    description: "Mark sessions completed and leave ratings to build peer learning reputations.",
    icon: Star,
  },
];

function Home() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await API.get("/analytics/trending");
        setTrending(res.data.trending || []);
      } catch {
        // Fallback gracefully
        setTrending([]);
      }
    };
    fetchTrending();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/skills?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate("/skills");
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-modern-section">
        <div className="hero-content-col">
          <div className="hero-pill-badge">
            <Sparkles size={14} className="hero-sparkle-icon" />
            <span>Campus Peer Knowledge Exchange</span>
          </div>

          <h1 className="hero-main-title">
            Teach what you love. <br />
            <span className="text-gradient">Master what you need.</span>
          </h1>

          <p className="hero-subtext">
            Connect directly with fellow college students to trade skills, book 1-on-1
            learning sessions, build real projects, and elevate your academic & tech careers.
          </p>

          <form className="hero-search-box" onSubmit={handleHeroSearch}>
            <Search size={18} className="hero-search-icon" />
            <input
              type="text"
              placeholder="Search Python, Figma, Calculus, React..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary">
              Find Mentor
            </button>
          </form>

          <div className="hero-trust-row">
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>100% Student-to-Student</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Online or In-Person</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Verified Peer Reviews</span>
            </div>
          </div>
        </div>

        <div className="hero-visual-col">
          <div className="hero-floating-card hero-card-primary">
            <div className="hero-mentor-preview">
              <div className="hero-mentor-avatar-box">
                <span className="hero-avatar-initials">YA</span>
              </div>
              <div>
                <strong>Ariz M.</strong>
                <p>Computer Science · 3rd Year</p>
                <div className="hero-rating-stars">
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span>4.9 (18 reviews)</span>
                </div>
              </div>
            </div>
            <div className="hero-card-skill-tag">
              <span>Teaching: React & Data Structures</span>
            </div>
            <p className="hero-card-quote">
              "Completed 12 peer sessions this semester helping 1st and 2nd years master trees and dynamic programming."
            </p>
          </div>

          <div className="hero-floating-card hero-card-secondary">
            <div className="hero-session-status-row">
              <span className="badge badge-success">Session Scheduled</span>
              <span className="hero-session-time">Today, 4:00 PM</span>
            </div>
            <strong>System Design & REST APIs</strong>
            <p className="hero-session-mode">Library 2nd Floor Study Room</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="home-section">
        <div className="section-header-centered">
          <span className="section-eyebrow">Seamless Process</span>
          <h2 className="section-heading-title">How Campus Skill Exchange Works</h2>
          <p className="section-heading-desc">
            Organized peer mentorship replacing messy group chats and random bulletin boards.
          </p>
        </div>

        <div className="how-it-works-grid">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.step} className="card how-step-card">
                <div className="step-card-top">
                  <span className="step-num-badge">{st.step}</span>
                  <div className="step-icon-wrap">
                    <Icon size={20} />
                  </div>
                </div>
                <h3 className="step-title">{st.title}</h3>
                <p className="step-desc">{st.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="home-section">
        <div className="section-header-between">
          <div>
            <span className="section-eyebrow">Explore Skills</span>
            <h2 className="section-heading-title">Browse Top Disciplines</h2>
          </div>
          <Link to="/skills" className="btn btn-secondary btn-small">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="categories-modern-grid">
          {categoryList.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/skills?category=${encodeURIComponent(cat.name)}`}
                className="card category-modern-card card-interactive"
              >
                <div className="category-icon-box">
                  <Icon size={22} />
                </div>
                <h3 className="category-title">{cat.name}</h3>
                <p className="category-desc">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending Skills Section */}
      {trending.length > 0 && (
        <section className="home-section">
          <div className="section-header-between">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={22} className="widget-icon-flame" />
              <div>
                <span className="section-eyebrow">Popular on Campus</span>
                <h2 className="section-heading-title">Trending Skill Sessions</h2>
              </div>
            </div>
            <Link to="/skills" className="btn btn-secondary btn-small">
              <span>Marketplace</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="trending-grid-modern">
            {trending.slice(0, 6).map((t, idx) => (
              <div key={t._id} className="card trending-card-box">
                <div className="trending-box-top">
                  <span className="trending-pill-rank">#{idx + 1} Trending</span>
                  <span className="badge badge-primary">{t.category}</span>
                </div>
                <h3 className="trending-box-title">{t.title}</h3>
                <div className="trending-box-bottom">
                  <span>{t.count} student requests</span>
                  <Link
                    to={`/skills?search=${encodeURIComponent(t.title)}`}
                    className="trending-view-link"
                  >
                    Find Mentors →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <section className="cta-banner-card">
        <div className="cta-banner-content">
          <h2 className="cta-title">Ready to learn, teach, and level up?</h2>
          <p className="cta-desc">
            Join hundreds of classmates exchanging knowledge in programming, engineering,
            design, and humanities. Free for students.
          </p>
          <div className="cta-actions-group">
            <Link to="/register" className="btn btn-primary btn-large">
              Create Student Account
            </Link>
            <Link to="/skills" className="btn btn-secondary btn-large">
              Explore Available Skills
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
