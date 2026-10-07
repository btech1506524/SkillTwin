import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  // ERR-008 FIX: Await login async result, handle errors, show feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);
      if (res && res.success) {
        if (res.offlineFallback) {
          setInfoMsg('Logged in with offline profile fallback.');
        }
        navigate('/dashboard');
      } else {
        setErrorMsg(res?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('An unexpected error occurred during login.');
    }
  };

  // ERR-009 FIX: Await demo login before navigation
  const handleDemoLogin = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      await loginDemo();
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to initialize demo login.');
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
            <div className="auth-tagline-badge"><Sparkles size={14} /> Welcome back</div>
            <h1>Sign in to your<br /><span>Career Twin</span></h1>
            <p>Access your personalized Sem 5 skill roadmap, placement readiness score, and AI recommendations.</p>
            
            <div className="auth-features">
              <div className="auth-feature"><div className="auth-feature-dot"></div>Placement readiness tracker & skill radar</div>
              <div className="auth-feature"><div className="auth-feature-dot"></div>Sem 5 Core CS curriculum benchmarks</div>
              <div className="auth-feature"><div className="auth-feature-dot"></div>Interactive growth simulator & AI career coach</div>
            </div>

            {/* Quick Demo Login Highlight */}
            <div className="demo-highlight-box">
              <div className="demo-badge"><Zap size={14} /> Evaluator / Quick Review</div>
              <p>Skip filling forms and experience the full Sem 5 CSE student dashboard with 1 click.</p>
              <button 
                type="button" 
                className="demo-action-btn"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <Zap size={16} />
                <span>{loading ? 'Accessing...' : 'Launch Demo Account (Sanjay · Sem 5 CSE)'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Student Sign In</h2>
              <p>Enter your student or university credentials</p>
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

            {infoMsg && (
              <div className="auth-info-alert" style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label>Password</label>
                  {/* ERR-029 FIX: Replace alert popup with helpful inline notice */}
                  <span 
                    style={{ fontSize: '12px', color: '#818cf8', cursor: 'pointer' }}
                    onClick={() => setInfoMsg('Use demo account or reset password via administrator.')}
                    className="forgot-link"
                  >
                    Forgot password?
                  </span>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : <><span>Sign In to Dashboard</span> <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="auth-divider"><span>or evaluate quickly</span></div>

            <button type="button" className="demo-quick-btn" onClick={handleDemoLogin} disabled={loading}>
              <Zap size={16} /> Continue as Demo Sem 5 CSE Student
            </button>

            <p className="auth-switch">
              New student? <Link to="/signup">Create your Career Twin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
