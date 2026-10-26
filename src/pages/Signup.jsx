import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OAuthButtons from '../components/OAuthButtons';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signup, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetRole = searchParams.get('targetRole')?.trim() || '';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ERR-010 & ERR-011 FIX: Await signup, include formData.password, check response status
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      setLoading(false);
      if (res && res.success) {
        const onboardingPath = targetRole
          ? `/onboarding?targetRole=${encodeURIComponent(targetRole)}`
          : '/onboarding';
        navigate(res.onboardingComplete ? '/dashboard' : onboardingPath);
      } else {
        setErrorMsg(res?.message || 'Failed to create student account.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('An unexpected error occurred during signup.');
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginDemo();
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to initialize demo mode.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1"></div>
      <div className="auth-glow auth-glow-2"></div>
      
      <div className="auth-container">
        <div className="auth-left">
          <Link to="/" className="auth-logo">
            <div className="logo-icon"><Brain size={22} /></div>
            <span>SkillTwin</span>
            <span className="logo-ai">AI</span>
          </Link>
          
          <div className="auth-left-content">
            <div className="auth-tagline-badge"><Sparkles size={14} /> Sem 5 CSE Edition</div>
            <h1>Generate your<br /><span>Digital Career Twin</span></h1>
            <p>Compare your current academic skills with top tech job descriptions and generate an actionable weekly milestone plan.</p>
            
            <div className="auth-features">
              <div className="auth-feature"><div className="auth-feature-dot"></div>Tailored for college placement & internship cycles</div>
              <div className="auth-feature"><div className="auth-feature-dot"></div>Skill-gap analysis for your selected career role</div>
              <div className="auth-feature"><div className="auth-feature-dot"></div>Interactive growth simulations with real-time score updates</div>
            </div>

            <div className="demo-highlight-box">
              <div className="demo-badge"><Zap size={14} /> Quick Evaluation Mode</div>
              <p>Explore a sample dashboard without creating an account. Demo changes stay in this browser.</p>
              <button 
                type="button" 
                className="demo-action-btn"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <Zap size={16} />
                <span>Launch Demo (Sem 5 Student)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create Student Profile</h2>
              <p>{targetRole ? `Set up your profile for ${targetRole}` : 'Configure your career twin parameters'}</p>
            </div>

            {errorMsg && (
              <div className="auth-error-alert" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="signup-name">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-email">College Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="signup-password">Create Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Building Twin...' : <><span>Initialize Career Twin</span> <ArrowRight size={18} /></>}
              </button>
            </form>

            <OAuthButtons />

            <div className="auth-divider"><span>or test directly</span></div>

            <button type="button" className="demo-quick-btn" onClick={handleDemoLogin} disabled={loading}>
              <Zap size={16} /> Instant Demo Access (Sample Data)
            </button>

            <p className="auth-switch">
              Already have a twin? <Link to="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
