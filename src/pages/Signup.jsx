import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, GraduationCap, Target, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signup, loginDemo } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    semester: '5',
    branch: 'Computer Science & Engineering',
    targetRole: 'Software Developer'
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
        password: formData.password, // ERR-011: Now explicitly passed!
        semester: formData.semester,
        branch: formData.branch,
        targetRole: formData.targetRole
      });

      setLoading(false);
      if (res && res.success) {
        navigate('/dashboard');
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
              <div className="auth-feature"><div className="auth-feature-dot"></div>Instant skill gap breakdown across 9 core subjects</div>
              <div className="auth-feature"><div className="auth-feature-dot"></div>Interactive growth simulations with real-time score updates</div>
            </div>

            <div className="demo-highlight-box">
              <div className="demo-badge"><Zap size={14} /> Quick Evaluation Mode</div>
              <p>Want to see the finished dashboard right away? Skip registration with one click.</p>
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
              <p>Configure your career twin parameters</p>
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
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
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
                <label>College Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="student@college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-row-dual">
                <div className="input-group">
                  <label>Semester</label>
                  <div className="input-wrapper">
                    <GraduationCap size={18} className="input-icon" />
                    <select name="semester" value={formData.semester} onChange={handleChange} required>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5 (Active)</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Target Career Goal</label>
                  <div className="input-wrapper">
                    <Target size={18} className="input-icon" />
                    <select name="targetRole" value={formData.targetRole} onChange={handleChange} required>
                      <option value="Software Developer">Software Developer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="AI / ML Engineer">AI / ML Engineer</option>
                      <option value="Data Analyst">Data Analyst</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Create Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
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

            <div className="auth-divider"><span>or test directly</span></div>

            <button type="button" className="demo-quick-btn" onClick={handleDemoLogin} disabled={loading}>
              <Zap size={16} /> Instant Demo Access (Preloaded Sem 5 Data)
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
