import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>SkillTwin<span>AI</span></h2>
          <p>Understand your skills. Build your roadmap. Simulate your future.</p>
        </div>
        <div className="footer-column">
          <h4>Platform</h4>
          <a href="#features">Features</a>
          <a href="#careers">Career Paths</a>
          <a href="#how-it-works">How It Works</a>
        </div>
        <div className="footer-column">
          <h4>Resources</h4>
          <a href="#about">About</a>
          {/* ERR-036 FIX: Avoid empty dead anchors; link to relevant sections or demo */}
          <Link to="/#features">Platform Guide</Link>
          <Link to="/login">Student Sign In</Link>
        </div>
      </div>
      <div className="footer-bottom">© 2026 SkillTwin AI. Built for students.</div>
    </footer>
  );
}
