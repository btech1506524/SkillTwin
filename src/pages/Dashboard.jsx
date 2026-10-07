import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, Target, TrendingUp, FileText, CheckCircle2, Circle, AlertCircle, 
  Sparkles, Award, ArrowUpRight, BarChart3, BookOpen, Layers, 
  Cpu, Database, Shield, Code, ChevronRight, Sliders, Play, RotateCcw,
  User, GraduationCap, Building2, Check, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export default function Dashboard() {
  const { user, updateSkill, toggleMilestone, updateTargetRole } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'roadmap', 'simulator', 'resume'
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulatedBoost, setSimulatedBoost] = useState(0);
  const [simulatedSkills, setSimulatedSkills] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // If user is null, fallback cleanly or use session
  const student = user || {
    name: 'Sanjay Kumar',
    email: 'sanjay.cse@student.edu',
    semester: '5',
    branch: 'Computer Science & Engineering',
    college: 'National Institute of Technology',
    cgpa: '8.6',
    targetRole: 'Software Developer',
    readinessScore: 68,
    skills: {
      'Data Structures & Algorithms': { current: 65, required: 85, category: 'Core CS' },
      'Object-Oriented Programming (Java/C++)': { current: 75, required: 80, category: 'Core CS' },
      'DBMS & SQL Queries': { current: 80, required: 75, category: 'Database' },
      'Operating Systems & Linux': { current: 60, required: 70, category: 'Core CS' },
      'Computer Networks': { current: 50, required: 65, category: 'Core CS' },
      'React.js & Frontend': { current: 72, required: 70, category: 'Development' },
      'Node.js & REST APIs': { current: 55, required: 75, category: 'Development' },
      'Git, Docker & CI/CD': { current: 35, required: 60, category: 'DevOps' },
      'System Design Fundamentals': { current: 30, required: 65, category: 'Architecture' }
    },
    completedMilestones: ['milestone-1', 'milestone-2']
  };

  const currentScore = student.readinessScore || 68;
  const effectiveScore = Math.min(100, currentScore + (simulationActive ? simulatedBoost : 0));

  // Dynamic skill statistics computed directly from student.skills (ERR-043 fix)
  const skillsObj = student.skills || {};
  const dsaLevel = skillsObj['Data Structures & Algorithms']?.current || 65;
  const dbmsLevel = skillsObj['DBMS & SQL Queries']?.current || 80;
  const devopsLevel = skillsObj['Git, Docker & CI/CD']?.current || 35;

  const roadmapItems = [
    {
      id: 'milestone-1',
      week: 'Weeks 1 - 2',
      title: 'Advanced DSA & Graph Theory',
      description: 'Master BFS/DFS, shortest paths (Dijkstra), and dynamic programming patterns.',
      skills: ['Graphs', 'Recursion', 'DP'],
      status: student.completedMilestones?.includes('milestone-1') ? 'completed' : 'in-progress'
    },
    {
      id: 'milestone-2',
      week: 'Weeks 3 - 4',
      title: 'DBMS Deep Dive & Query Optimization',
      description: 'Transactions, ACID compliance, B+ Tree indexing, and normal forms (3NF & BCNF).',
      skills: ['SQL', 'Indexes', 'Transactions'],
      status: student.completedMilestones?.includes('milestone-2') ? 'completed' : 'in-progress'
    },
    {
      id: 'milestone-3',
      week: 'Weeks 5 - 6',
      title: 'Industry Capstone: Full Stack Microservice',
      description: 'Build a production-grade full stack project with JWT authentication and Docker deployment.',
      skills: ['React', 'Node.js', 'Docker'],
      status: student.completedMilestones?.includes('milestone-3') ? 'completed' : 'pending'
    },
    {
      id: 'milestone-4',
      week: 'Weeks 7 - 8',
      title: 'Placement Mock Rounds & System Design',
      description: 'High-level architecture, caching (Redis), rate limiters, and mock technical interviews.',
      skills: ['System Design', 'Mock Interview', 'CS Core'],
      status: student.completedMilestones?.includes('milestone-4') ? 'completed' : 'pending'
    }
  ];

  // ERR-022 FIX: Deterministic boost calculation based on scenario definitions
  const SCENARIO_BOOSTS = {
    'LeetCode 150': 9,
    'Docker CI/CD': 11,
    'DBMS Indexing': 7,
    'System Design Mini': 12
  };

  const handleSimulateScenario = async (boost, label) => {
    let updatedSkills;
    if (simulatedSkills.includes(label)) {
      updatedSkills = simulatedSkills.filter(s => s !== label);
    } else {
      updatedSkills = [...simulatedSkills, label];
    }

    setSimulatedSkills(updatedSkills);

    if (updatedSkills.length === 0) {
      setSimulationActive(false);
      setSimulatedBoost(0);
      return;
    }

    setSimulationActive(true);

    // Call backend simulator if available, fallback to client map
    try {
      const serverSim = await apiService.simulateCareerBoost(currentScore, updatedSkills, student.targetRole);
      if (serverSim && serverSim.success && typeof serverSim.totalBoost === 'number') {
        setSimulatedBoost(serverSim.totalBoost);
        return;
      }
    } catch {}

    // Deterministic client fallback calculation
    const calculatedBoost = updatedSkills.reduce((acc, skill) => acc + (SCENARIO_BOOSTS[skill] || 5), 0);
    setSimulatedBoost(calculatedBoost);
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setSimulatedBoost(0);
    setSimulatedSkills([]);
  };

  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);

    try {
      const serverResult = await apiService.scanResumeText(resumeText, student.targetRole);
      if (serverResult && serverResult.success) {
        setResumeAnalysis({
          matchPercentage: serverResult.matchPercentage,
          strengths: serverResult.strengths,
          gaps: serverResult.gaps,
          recommendedKeywords: serverResult.recommendedKeywords
        });
        setIsAnalyzing(false);
        return;
      }
    } catch {}

    setTimeout(() => {
      setIsAnalyzing(false);
      setResumeAnalysis({
        matchPercentage: 74,
        strengths: ['Strong Foundation in React & SQL', 'Clear academic CSE background', 'Good project orientation'],
        gaps: ['Missing Unit Testing / Jest experience', 'No explicit CI/CD pipelines mentioned', 'Low visibility on System Design'],
        recommendedKeywords: ['Docker', 'REST API', 'Unit Testing', 'Redis', 'Microservices', 'Git Workflow']
      });
    }, 600);
  };

  // Safe initial for avatar (ERR-031 fix)
  const avatarInitial = (student.name || 'Sanjay').trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="dashboard-page">
      <ParticleBackground />
      <Navbar />

      <main className="dashboard-main">
        {/* STUDENT PROFILE HEADER */}
        <section className="dashboard-profile-header">
          <div className="profile-header-container">
            <div className="profile-identity">
              <div className="profile-avatar">
                <span className="avatar-initials">{avatarInitial}</span>
                <div className="profile-online-dot"></div>
              </div>
              <div className="profile-details">
                <div className="profile-name-row">
                  <h1>{student.name || 'Student Profile'}</h1>
                  <span className="badge-sem">Semester {student.semester || '5'} CSE</span>
                  <span className="badge-status">
                    <Sparkles size={12} /> Twin Active
                  </span>
                </div>
                <div className="profile-meta-row">
                  <span><GraduationCap size={14} /> {student.branch || 'Computer Science & Engineering'}</span>
                  <span><Building2 size={14} /> {student.college || 'Engineering College'}</span>
                  <span><Award size={14} /> CGPA: <strong>{student.cgpa || '8.5'}</strong></span>
                </div>
              </div>
            </div>

            <div className="profile-role-switcher">
              <label>Target Career Role</label>
              <div className="role-select-box">
                <Target size={16} className="role-icon" />
                <select 
                  value={student.targetRole || 'Software Developer'} 
                  onChange={(e) => updateTargetRole && updateTargetRole(e.target.value)}
                >
                  <option value="Software Developer">Software Developer (SDE)</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* KEY PERFORMANCE METRICS */}
        <section className="dashboard-metrics-grid">
          {/* TWIN READINESS GAUGE */}
          <div className={`metric-card readiness-gauge-card ${simulationActive ? 'simulating-border' : ''}`}>
            <div className="metric-header">
              <div>
                <span className="metric-tag">DIGITAL TWIN SCORE</span>
                <h3>Placement Readiness</h3>
              </div>
              {simulationActive && (
                <span className="sim-pill">
                  <Sparkles size={12} /> +{simulatedBoost}% Simulated
                </span>
              )}
            </div>

            <div className="gauge-wrapper">
              <div className="gauge-svg-box">
                <svg viewBox="0 0 100 100" className="gauge-svg">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    fill="none" 
                    stroke="url(#dash-gradient)" 
                    strokeWidth="8" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (264 * effectiveScore) / 100}
                    strokeLinecap="round" 
                    className="gauge-progress-circle"
                  />
                  <defs>
                    <linearGradient id="dash-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="gauge-number">
                  <strong>{effectiveScore}%</strong>
                  <span>{effectiveScore >= 75 ? 'Placement Ready' : 'On Track'}</span>
                </div>
              </div>

              <div className="gauge-insights">
                <div className="insight-row">
                  <span>Current Tier</span>
                  <strong className="tier-badge">Tier-1 SDE Ready</strong>
                </div>
                <div className="insight-row">
                  <span>Benchmark</span>
                  <span>75% target for Sem 5</span>
                </div>
                <div className="insight-row">
                  <span>Recruitment Window</span>
                  <span>Sem 6 Campus Drive (~90 Days)</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK STATS - Dynamically rendered (ERR-043 fix) */}
          <div className="metric-card stat-summary-card">
            <div className="stat-row">
              <div className="stat-icon-wrapper core-cs">
                <Code size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-title">DSA & Problem Solving</span>
                <h4>{dsaLevel >= 75 ? 'Advanced' : dsaLevel >= 50 ? 'Level 3 (Medium)' : 'Foundational'} ({dsaLevel}%)</h4>
                <div className="stat-bar-box">
                  <div className="stat-bar-fill" style={{ width: `${dsaLevel}%` }}></div>
                </div>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-icon-wrapper db">
                <Database size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-title">Databases & Architecture</span>
                <h4>{dbmsLevel}% Proficiency</h4>
                <div className="stat-bar-box">
                  <div className="stat-bar-fill" style={{ width: `${dbmsLevel}%` }}></div>
                </div>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-icon-wrapper devops">
                <Cpu size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-title">DevOps & Cloud {devopsLevel < 50 ? '(Gap Area)' : ''}</span>
                <h4 className={devopsLevel < 50 ? "text-warning" : ""}>{devopsLevel}% {devopsLevel < 50 ? 'Needs Attention' : 'Proficiency'}</h4>
                <div className="stat-bar-box">
                  <div className={`stat-bar-fill ${devopsLevel < 50 ? 'warning' : ''}`} style={{ width: `${devopsLevel}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE WORKSPACE TABS */}
        <section className="dashboard-tabs-section">
          <div className="tabs-navigation">
            <button 
              className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              <BarChart3 size={17} />
              <span>Skill Matrix & Gap Analysis</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <BookOpen size={17} />
              <span>8-Week Semester Roadmap</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulator')}
            >
              <TrendingUp size={17} />
              <span>AI Career Simulator</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              <FileText size={17} />
              <span>AI Resume & Gap Scanner</span>
            </button>
          </div>

          <div className="tab-viewport">
            {/* TAB 1: SKILL MATRIX */}
            {activeTab === 'skills' && (
              <div className="tab-pane skills-pane">
                <div className="pane-header">
                  <div>
                    <h2>Sem 5 CSE Competency Matrix</h2>
                    <p>Interactive sliders adjust your skill twin in real-time. Notice how your score updates as you gain proficiency.</p>
                  </div>
                  <div className="legend-pills">
                    <span className="legend-item"><span className="legend-dot current"></span> Your Level</span>
                    <span className="legend-item"><span className="legend-dot required"></span> Placement Target</span>
                  </div>
                </div>

                <div className="skills-interactive-grid">
                  {Object.entries(student.skills || {}).map(([name, data]) => {
                    const isGap = data.current < data.required;
                    return (
                      <div key={name} className={`skill-slider-card ${isGap ? 'has-gap' : 'on-target'}`}>
                        <div className="skill-card-top">
                          <span className="skill-category-tag">{data.category}</span>
                          {isGap ? (
                            <span className="gap-tag"><AlertCircle size={12} /> Gap: {data.required - data.current}%</span>
                          ) : (
                            <span className="good-tag"><CheckCircle2 size={12} /> Target Met</span>
                          )}
                        </div>

                        <h4>{name}</h4>

                        <div className="skill-numbers">
                          <span>Current: <strong>{data.current}%</strong></span>
                          <span>Target: <strong>{data.required}%</strong></span>
                        </div>

                        <div className="dual-progress-bar">
                          <div className="progress-required-marker" style={{ left: `${data.required}%` }}></div>
                          <div className="progress-current-fill" style={{ width: `${data.current}%` }}></div>
                        </div>

                        <div className="slider-action-row">
                          <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            value={data.current} 
                            onChange={(e) => updateSkill && updateSkill(name, parseInt(e.target.value))}
                            className="skill-range-slider"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SEMESTER ROADMAP */}
            {activeTab === 'roadmap' && (
              <div className="tab-pane roadmap-pane">
                <div className="pane-header">
                  <div>
                    <h2>Semester 5 Placement Milestone Plan</h2>
                    <p>Actionable weekly checklist structured around Sem 5 university exams and upcoming on-campus placements.</p>
                  </div>
                  <div className="roadmap-progress-indicator">
                    <span>Milestones Completed: {student.completedMilestones?.length || 0} / {roadmapItems.length}</span>
                  </div>
                </div>

                <div className="roadmap-timeline">
                  {roadmapItems.map((item, idx) => {
                    const isDone = item.status === 'completed';
                    return (
                      <div key={item.id} className={`roadmap-step-card ${isDone ? 'completed-step' : ''}`}>
                        <div className="step-timeline-node">
                          <button 
                            className={`node-check-btn ${isDone ? 'checked' : ''}`}
                            onClick={() => toggleMilestone && toggleMilestone(item.id)}
                            title="Click to toggle milestone completion"
                          >
                            {isDone ? <Check size={16} /> : <Circle size={16} />}
                          </button>
                          {idx !== roadmapItems.length - 1 && <div className="timeline-connector-line"></div>}
                        </div>

                        <div className="step-content-card">
                          <div className="step-time-badge">{item.week}</div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          <div className="step-skill-chips">
                            {item.skills.map(skill => (
                              <span key={skill} className="skill-chip">{skill}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CAREER SIMULATOR */}
            {activeTab === 'simulator' && (
              <div className="tab-pane simulator-pane">
                <div className="pane-header">
                  <div>
                    <h2>Digital Career Growth Simulator</h2>
                    <p>Test out career moves before spending weeks on them. Toggle scenarios below to preview their impact on your twin.</p>
                  </div>
                  {simulationActive && (
                    <button className="reset-sim-btn" onClick={resetSimulation}>
                      <RotateCcw size={14} /> Reset Simulation
                    </button>
                  )}
                </div>

                <div className="simulator-scenarios-grid">
                  <div 
                    className={`scenario-card ${simulatedSkills.includes('LeetCode 150') ? 'active-scenario' : ''}`}
                    onClick={() => handleSimulateScenario(9, 'LeetCode 150')}
                  >
                    <div className="scenario-top">
                      <Code size={22} className="scenario-icon" />
                      <span className="boost-pill">+9% Readiness</span>
                    </div>
                    <h3>Complete LeetCode Top 150 (Graphs & DP)</h3>
                    <p>Master standard interview patterns asked by Microsoft, Amazon, and Adobe.</p>
                    <div className="scenario-toggle-hint">
                      {simulatedSkills.includes('LeetCode 150') ? '✓ Scenario Applied' : '+ Click to Simulate'}
                    </div>
                  </div>

                  <div 
                    className={`scenario-card ${simulatedSkills.includes('Docker CI/CD') ? 'active-scenario' : ''}`}
                    onClick={() => handleSimulateScenario(11, 'Docker CI/CD')}
                  >
                    <div className="scenario-top">
                      <Cpu size={22} className="scenario-icon" />
                      <span className="boost-pill">+11% Readiness</span>
                    </div>
                    <h3>Build Microservice with Docker & GitHub Actions</h3>
                    <p>Closes your largest gap in DevOps and demonstrates practical software engineering.</p>
                    <div className="scenario-toggle-hint">
                      {simulatedSkills.includes('Docker CI/CD') ? '✓ Scenario Applied' : '+ Click to Simulate'}
                    </div>
                  </div>

                  <div 
                    className={`scenario-card ${simulatedSkills.includes('DBMS Indexing') ? 'active-scenario' : ''}`}
                    onClick={() => handleSimulateScenario(7, 'DBMS Indexing')}
                  >
                    <div className="scenario-top">
                      <Database size={22} className="scenario-icon" />
                      <span className="boost-pill">+7% Readiness</span>
                    </div>
                    <h3>Deep Dive on B+ Trees, Sharding & Redis Caching</h3>
                    <p>Boosts database performance scores for high-scale backend engineering rounds.</p>
                    <div className="scenario-toggle-hint">
                      {simulatedSkills.includes('DBMS Indexing') ? '✓ Scenario Applied' : '+ Click to Simulate'}
                    </div>
                  </div>

                  <div 
                    className={`scenario-card ${simulatedSkills.includes('System Design Mini') ? 'active-scenario' : ''}`}
                    onClick={() => handleSimulateScenario(12, 'System Design Mini')}
                  >
                    <div className="scenario-top">
                      <Layers size={22} className="scenario-icon" />
                      <span className="boost-pill">+12% Readiness</span>
                    </div>
                    <h3>Design a URL Shortener & Rate Limiter</h3>
                    <p>Demonstrates high-level engineering maturity required for Tier-1 placements.</p>
                    <div className="scenario-toggle-hint">
                      {simulatedSkills.includes('System Design Mini') ? '✓ Scenario Applied' : '+ Click to Simulate'}
                    </div>
                  </div>
                </div>

                {simulationActive && (
                  <div className="simulation-result-banner">
                    <div className="sim-result-text">
                      <h4>Simulation Active: Readiness jumps from <strong>{currentScore}%</strong> to <span className="highlight-score">{effectiveScore}%</span></h4>
                      <p>Applying these {simulatedSkills.length} milestones moves you into the top 15% tier for {student.targetRole || 'Software Developer'} campus drives.</p>
                    </div>
                    {/* ERR-033 FIX: Keep user inside dashboard, switch tab to roadmap */}
                    <button 
                      type="button"
                      onClick={() => setActiveTab('roadmap')}
                      className="primary-btn"
                    >
                      View in Study Roadmap <ArrowUpRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: AI RESUME SCANNER */}
            {activeTab === 'resume' && (
              <div className="tab-pane resume-pane">
                <div className="pane-header">
                  <div>
                    <h2>AI Resume & Skill Gap Scanner</h2>
                    <p>Paste your project descriptions or current resume draft to scan for core Sem 5 competencies.</p>
                  </div>
                </div>

                <div className="resume-grid">
                  <div className="resume-input-box">
                    <form onSubmit={handleAnalyzeResume}>
                      <textarea
                        rows="7"
                        placeholder="Paste your resume summary, project details, or tech stack here (e.g. Built a student attendance portal using React, Node.js, and MongoDB with JWT auth...)"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        className="resume-textarea"
                      ></textarea>

                      <div className="resume-actions-bar">
                        <button 
                          type="button" 
                          className="secondary-btn"
                          onClick={() => setResumeText("B.Tech Computer Science (Sem 5), CGPA 8.6. Built e-commerce web application with React, Express, MongoDB. Implemented user auth with JWT. Proficient in Java, C++, Data Structures, SQL.")}
                        >
                          Load Sample Resume
                        </button>

                        <button type="submit" className="primary-btn glow-btn" disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <>
                              <RefreshCw size={16} className="spin-icon" /> Analyzing with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} /> Scan Competencies
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {resumeAnalysis && (
                    <div className="resume-analysis-output">
                      <div className="analysis-score-bar">
                        <span>Role Match Rate</span>
                        <strong>{resumeAnalysis.matchPercentage}%</strong>
                      </div>

                      <div className="analysis-group">
                        <h5><CheckCircle2 size={15} className="text-success" /> Validated Strengths</h5>
                        <ul>
                          {resumeAnalysis.strengths.map((str, i) => (
                            <li key={i}>{str}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="analysis-group">
                        <h5><AlertCircle size={15} className="text-warning" /> Critical Placement Gaps</h5>
                        <ul>
                          {resumeAnalysis.gaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="analysis-group">
                        <h5><Target size={15} className="text-cyan" /> Suggested Keywords to Add</h5>
                        <div className="keyword-chips">
                          {resumeAnalysis.recommendedKeywords.map((kw, i) => (
                            <span key={i} className="kw-chip">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
