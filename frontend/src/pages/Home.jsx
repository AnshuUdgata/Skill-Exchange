import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/api";

const categories = [
  "Programming",
  "Design",
  "Academics",
  "Communication",
  "Web Development",
  "Other",
];

const steps = [
  {
    title: "Find a skill",
    description: "Search the most popular student-led skills and choose what fits your goals.",
  },
  {
    title: "Request a session",
    description: "Send a request to a skill provider and schedule a time that works for both of you.",
  },
  {
    title: "Learn or teach",
    description: "Share knowledge, get feedback, and build your campus reputation.",
  },
];

function Home() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await API.get("/analytics/trending");
        setTrending(res.data.trending || []);
      } catch (err) {
        // ignore
      }
    };
    fetchTrending();
  }, []);
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Campus Skill Exchange</span>
          <h1>Teach what you know. Learn what you need.</h1>
          <p>
            Connect with fellow students, share your expertise, and book sessions to
            grow together in programming, design, academics, and more.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/skills">
              Explore Skills
            </Link>
            <Link className="btn btn-secondary" to="/register">
              Offer a Skill
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <strong>Find a session</strong>
            <p>Browse student instructors and book a learning session quickly.</p>
          </div>
          <div className="hero-card hero-card-alt">
            <strong>Share your skill</strong>
            <p>List a topic you can teach and attract learners on campus.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
        <div className="section-heading">
          <p>How it works</p>
          <h2>Learn, teach, and grow together in four simple steps.</h2>
        </div>
        <div className="how-grid">
          {steps.map((step) => (
            <article key={step.title} className="how-card">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <p>Popular categories</p>
          <h2>Browse top student skills by category.</h2>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category} className="category-card">
              <span>{category}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="trending-section">
        <div className="section-heading">
          <p>Trending</p>
          <h2>Trending skills on campus</h2>
        </div>
        <div className="trending-list">
          {trending.length > 0 ? (
            trending.map((t) => (
              <div key={t._id} className="trending-item">
                <strong>{t.title}</strong>
                <span>{t.category}</span>
                <small>{t.count} requests</small>
              </div>
            ))
          ) : (
            <div className="empty-state">No trending skills yet.</div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div>
          <h2>Ready to jump in?</h2>
          <p>
            Create your profile, add your first skill offer, or start exploring
            sessions today.
          </p>
        </div>
        <div className="cta-actions">
          <Link className="btn btn-primary" to="/register">
            Create profile
          </Link>
          <Link className="btn btn-secondary" to="/skills">
            Browse skills
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
