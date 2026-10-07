import { Brain, Menu, X, User, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isHome = location.pathname === "/";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon"><Brain size={22}/></div>
          <span>SkillTwin</span>
          <span className="logo-ai">AI</span>
        </Link>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          {isHome ? (
            <>
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#careers" onClick={() => setMenuOpen(false)}>Career Paths</a>
              <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            </>
          ) : (
            <>
              <Link to="/#features" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link to="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link>
              <Link to="/#careers" onClick={() => setMenuOpen(false)}>Career Paths</Link>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            </>
          )}

          {user ? (
            <div className="nav-user-controls">
              <Link
                to="/dashboard"
                className="dashboard-nav-btn"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>

              <div className="user-profile-badge">
                <div className="user-avatar-mini">
                  <User size={14} />
                </div>
                <div className="user-meta-mini">
                  <span className="user-name-mini">{user.name.split(' ')[0]}</span>
                  <span className="user-sem-mini">Sem {user.semester} CSE</span>
                </div>
              </div>

              <button
                className="logout-nav-btn"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                title="Sign Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-buttons">
              <Link
                to="/login"
                className="login-btn"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="signup-btn glow-btn"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
    </nav>
  );
}
