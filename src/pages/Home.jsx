import { ArrowRight, Brain, Target, TrendingUp, FileText, Map, Sparkles, Users, Award, Zap, GraduationCap, Code, Database, BarChart3, Shield, Cpu, Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import AnimatedSection from "../components/AnimatedSection";
import ParticleBackground from "../components/ParticleBackground";
import CountUp from "../components/CountUp";
import TestimonialCard from "../components/TestimonialCard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  // ERR-028 FIX: Await loginDemo before navigating to avoid race conditions
  const handleQuickDemo = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    }
  };

  const handleCareerSelect = (roleName) => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="home">
      <ParticleBackground />
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-content">
          <AnimatedSection>
            <div className="hero-badge"><Sparkles size={16} /> Sem 5 CSE Edition · AI Career Intelligence</div>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h1>Build the career<span> you actually want.</span></h1>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="hero-desc">SkillTwin AI analyzes your skills, projects and academic profile to identify your skill gaps, build a personalized roadmap and simulate your career growth for campus placements.</p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <div className="hero-buttons">
              <button onClick={handleStart} className="primary-btn glow-btn">
                {user ? 'Open My Dashboard' : 'Build My Career Twin'} <ArrowRight size={18} />
              </button>
              <a href="#careers" className="secondary-btn">Explore Careers</a>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={400}>
            <div className="hero-stats">
              <div><strong><CountUp end={50} suffix="+" /></strong><span>Skills Tracked</span></div>
              <div><strong><CountUp end={6} suffix="+" /></strong><span>Career Paths</span></div>
              <div><strong>AI</strong><span>Powered</span></div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={200} className="hero-dashboard-wrapper">
          <div className="hero-dashboard" onClick={handleStart} style={{ cursor: 'pointer' }} title="Click to open interactive dashboard">
            <div className="dashboard-glow"></div>
            <div className="dashboard-header">
              <div>
                <small>Your Career Twin (Interactive)</small>
                <h3>Software Developer</h3>
              </div>
              <div className="status-badge"><div className="status-dot"></div> Active</div>
            </div>
            <div className="readiness">
              <div className="score-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="6" strokeDasharray="264" strokeDashoffset="84" strokeLinecap="round" className="score-ring-progress" />
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                </svg>
                <div className="score-text"><strong>68%</strong><span>Ready</span></div>
              </div>
              <div className="readiness-info">
                <p>Campus Placement Readiness</p>
                <div className="progress-bar"><div style={{ width: '68%' }}></div></div>
                <small>Tier-1 SDE benchmark: 75% · Tap to simulate</small>
              </div>
            </div>
            <div className="mini-skills">
              <div className="mini-skill-item"><span>DSA</span><div className="mini-bar"><div style={{ width: '48%' }}></div></div><strong>48%</strong></div>
              <div className="mini-skill-item"><span>Development</span><div className="mini-bar"><div style={{ width: '72%' }}></div></div><strong>72%</strong></div>
              <div className="mini-skill-item"><span>Database</span><div className="mini-bar"><div style={{ width: '80%' }}></div></div><strong>80%</strong></div>
              <div className="mini-skill-item"><span>DevOps</span><div className="mini-bar"><div style={{ width: '25%' }}></div></div><strong>25%</strong></div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== TRUSTED BY (SOCIAL PROOF) ===== */}
      <section className="trust-section">
        <AnimatedSection>
          <p className="trust-label">Aligned with curriculum standards across</p>
          <div className="trust-logos">
            <span>🎓 KTU</span>
            <span>🎓 VTU</span>
            <span>🎓 CUSAT</span>
            <span>🎓 Anna University</span>
            <span>🎓 Mumbai University</span>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section" id="features">
        <AnimatedSection>
          <div className="section-heading">
            <span>POWERFUL FEATURES</span>
            <h2>Your career,<br /><strong>understood intelligently.</strong></h2>
            <p>Everything you need to understand your current position and plan your next career move.</p>
          </div>
        </AnimatedSection>
        <div className="features-grid">
          <AnimatedSection delay={0}><FeatureCard icon={<Target />} title="Skill Gap Analysis" description="Discover exactly which skills you need to improve for your target career." /></AnimatedSection>
          <AnimatedSection delay={80}><FeatureCard icon={<FileText />} title="AI Resume Analyzer" description="Analyze your resume and identify skills, strengths and improvement areas." /></AnimatedSection>
          <AnimatedSection delay={160}><FeatureCard icon={<Map />} title="Personalized Roadmap" description="Get a structured learning roadmap based on your current profile." /></AnimatedSection>
          <AnimatedSection delay={240}><FeatureCard icon={<Brain />} title="AI Career Assistant" description="Ask career questions and receive personalized guidance based on your profile." /></AnimatedSection>
          <AnimatedSection delay={320}><FeatureCard icon={<TrendingUp />} title="Career Simulator" description="Explore how your career-readiness profile changes when you add new skills." /></AnimatedSection>
          <AnimatedSection delay={400}><FeatureCard icon={<Sparkles />} title="Progress Analytics" description="Track your skills, learning progress and roadmap completion." /></AnimatedSection>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="workflow-section" id="how-it-works">
        <AnimatedSection>
          <div className="section-heading">
            <span>HOW IT WORKS</span>
            <h2>From confusion<br /><strong>to a clear roadmap.</strong></h2>
          </div>
        </AnimatedSection>
        <div className="workflow">
          <AnimatedSection delay={0}>
            <div className="workflow-step">
              <div className="step-number">01</div>
              <h3>Build Your Profile</h3>
              <p>Add your academic information, skills, projects and career goal.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={120}>
            <div className="workflow-step">
              <div className="step-number">02</div>
              <h3>Analyze Your Skills</h3>
              <p>SkillTwin compares your current skills with your selected career.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={240}>
            <div className="workflow-step">
              <div className="step-number">03</div>
              <h3>Find Your Gaps</h3>
              <p>Discover the most important skills you need to improve.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={360}>
            <div className="workflow-step">
              <div className="step-number">04</div>
              <h3>Simulate Your Growth</h3>
              <p>Test what happens when you add skills, projects or assessments.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== CAREER PATHS ===== */}
      <section className="career-section" id="careers">
        <AnimatedSection>
          <div className="section-heading">
            <span>CAREER PATHS</span>
            <h2>Choose where<br /><strong>you want to go.</strong></h2>
          </div>
        </AnimatedSection>
        <div className="career-grid">
          <AnimatedSection delay={0}><div className="career-card" onClick={() => handleCareerSelect('Software Developer')} style={{ cursor: 'pointer' }}><div className="career-card-icon"><Code size={24} /></div><span>01</span><h3>Software Developer</h3><p>DSA · OOP · DBMS · Development</p></div></AnimatedSection>
          <AnimatedSection delay={80}><div className="career-card" onClick={() => handleCareerSelect('Frontend Developer')} style={{ cursor: 'pointer' }}><div className="career-card-icon"><Zap size={24} /></div><span>02</span><h3>Frontend Developer</h3><p>React · JavaScript · UI · Web</p></div></AnimatedSection>
          <AnimatedSection delay={160}><div className="career-card" onClick={() => handleCareerSelect('Backend Developer')} style={{ cursor: 'pointer' }}><div className="career-card-icon"><Database size={24} /></div><span>03</span><h3>Backend Developer</h3><p>Node.js · APIs · Databases · Security</p></div></AnimatedSection>
          <AnimatedSection delay={240}><div className="career-card" onClick={() => handleCareerSelect('Full Stack Developer')} style={{ cursor: 'pointer' }}><div className="career-card-icon"><Shield size={24} /></div><span>04</span><h3>Full Stack Developer</h3><p>Frontend · Backend · Database · DevOps</p></div></AnimatedSection>
          <AnimatedSection delay={320}><div className="career-card" onClick={() => handleCareerSelect('Data Analyst')} style={{ cursor: 'pointer' }}><div className="career-card-icon"><BarChart3 size={24} /></div><span>05</span><h3>Data Analyst</h3><p>SQL · Python · Statistics · Visualization</p></div></AnimatedSection>
          <AnimatedSection delay={400}><div className="career-card" onClick={() => handleCareerSelect('AI / ML Engineer')} style={{ cursor: 'pointer' }}><div className="career-card-icon"><Cpu size={24} /></div><span>06</span><h3>AI / ML Engineer</h3><p>Python · ML · Mathematics · AI</p></div></AnimatedSection>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section" id="about">
        <AnimatedSection>
          <div className="section-heading">
            <span>WHAT STUDENTS SAY</span>
            <h2>Loved by<br /><strong>future engineers.</strong></h2>
          </div>
        </AnimatedSection>
        <div className="testimonials-grid">
          <AnimatedSection delay={0}><TestimonialCard avatar="A" name="Arun K." role="CSE, Sem 6" quote="SkillTwin showed me I was missing key DSA skills for my dream SDE role. The roadmap was a lifesaver!" /></AnimatedSection>
          <AnimatedSection delay={120}><TestimonialCard avatar="S" name="Sneha R." role="IT, Sem 5" quote="The career simulator feature is incredible. I could see exactly how learning React would boost my profile." /></AnimatedSection>
          <AnimatedSection delay={240}><TestimonialCard avatar="D" name="Dev P." role="CSE, Sem 7" quote="I uploaded my resume and got instant feedback on what to improve. Way better than asking seniors!" /></AnimatedSection>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <AnimatedSection>
          <div className="cta-glow"></div>
          <div className="cta-content">
            <h2>Ready to build your<br /><strong>Career Twin?</strong></h2>
            <p>Join hundreds of students who are already using SkillTwin AI to plan smarter careers.</p>
            <div className="cta-buttons">
              <button onClick={handleStart} className="primary-btn glow-btn">
                {user ? 'Open Dashboard' : 'Get Started Free'} <ArrowRight size={18} />
              </button>
              <button onClick={handleQuickDemo} className="secondary-btn">
                <Play size={15} /> Instant Demo Mode
              </button>
            </div>
          </div>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
}
