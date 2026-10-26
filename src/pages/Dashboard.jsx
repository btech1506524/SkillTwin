import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Brain, Target, TrendingUp, FileText, CheckCircle2, Circle, AlertCircle, 
  Sparkles, Award, ArrowUpRight, ArrowRight, BarChart3, BookOpen, Layers,
  Cpu, Database, Shield, Code, ChevronRight, Sliders, Play, RotateCcw,
  User, GraduationCap, Building2, Check, RefreshCw, ClipboardCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import AssessmentsPanel from '../components/AssessmentsPanel';
import OAuthButtons from '../components/OAuthButtons';

const summarizeRoadmapItems = (items) => {
  const completed = items.filter(item => item.status === 'completed').length;
  const inProgress = items.filter(item => item.status === 'in-progress').length;
  const planned = items.filter(item => item.status === 'pending').length;
  return {
    total: items.length,
    completed,
    inProgress,
    planned,
    percentage: items.length ? Math.round(completed / items.length * 100) : 0
  };
};

export default function Dashboard() {
  const { user, updateSkill, toggleMilestone, refreshCareerReadiness } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'roadmap', 'simulator', 'resume'
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulatedBoost, setSimulatedBoost] = useState(0);
  const [simulatedSkills, setSimulatedSkills] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [roadmapItems, setRoadmapItems] = useState([]);
  const [roadmapProgress, setRoadmapProgress] = useState({ total: 0, completed: 0, inProgress: 0, planned: 0, percentage: 0 });
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');
  const [skillUpdateError, setSkillUpdateError] = useState('');
  const simulationRequest = useRef(0);

  useEffect(() => {
    refreshCareerReadiness();
  }, [refreshCareerReadiness]);

  // If user is null, fallback cleanly or use session
  const student = user || {};

  const readinessCalculated = student.readinessScore != null;
  const currentScore = readinessCalculated ? Number(student.readinessScore) : 0;
  const effectiveScore = Math.min(100, currentScore + (simulationActive ? simulatedBoost : 0));

  // Dynamic skill statistics computed directly from student.skills (ERR-043 fix)
  const skillsObj = student.skills || {};
  const dsaLevel = skillsObj['Data Structures & Algorithms']?.missing ? null : skillsObj['Data Structures & Algorithms']?.current;
  const dbmsLevel = skillsObj['DBMS & SQL Queries']?.missing ? null : skillsObj['DBMS & SQL Queries']?.current;
  const devopsLevel = skillsObj['Git, Docker & CI/CD']?.missing ? null : skillsObj['Git, Docker & CI/CD']?.current;
  const displayedSkills = student.demo
    ? Object.entries(student.skills || {})
    : (student.savedSkills || []).map(skill => [skill.skillName, {
      current: skill.current,
      required: skillsObj[skill.skillName]?.missing ? null : skillsObj[skill.skillName]?.required ?? null,
      category: skill.category
    }]);

  const fallbackRoadmapItems = student.demoRoadmap || [
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

  const syncRoadmap = async (regenerate = false) => {
    if (!localStorage.getItem('skilltwin_token') && student.demo) {
      setRoadmapItems(fallbackRoadmapItems);
      setRoadmapProgress(summarizeRoadmapItems(fallbackRoadmapItems));
      setRoadmapError('');
      return;
    }
    setRoadmapLoading(true);
    setRoadmapError('');
    const response = regenerate
      ? await apiService.generateLearningRoadmap()
      : await apiService.getLearningRoadmap();
    if (response?.success && response.roadmap) {
      const items = response.roadmap.milestones.map(item => ({
        id: item.id,
        week: `Step ${item.sequence}`,
        title: item.title,
        description: `${item.description} ${item.outcome}`,
        skills: [item.skillName],
        completedAt: item.completedAt,
        status: item.status === 'Completed' ? 'completed' : item.status === 'In Progress' ? 'in-progress' : 'pending'
      }));
      setRoadmapItems(items);
      setRoadmapProgress(response.roadmap.progress || summarizeRoadmapItems(items));
    } else if (response?.success) {
      setRoadmapItems([]);
      setRoadmapProgress({ total: 0, completed: 0, inProgress: 0, planned: 0, percentage: 0 });
      setRoadmapError('');
    } else {
      setRoadmapError(response?.message || 'Unable to load your learning roadmap.');
    }
    setRoadmapLoading(false);
  };

  useEffect(() => {
    syncRoadmap();
  }, [user?.id, student.targetRole]);

  const handleRoadmapMilestone = async (item) => {
    if (!localStorage.getItem('skilltwin_token') && student.demo) {
      await toggleMilestone?.(item.id);
      return;
    }
    const status = item.status === 'completed' ? 'Planned' : item.status === 'in-progress' ? 'Completed' : 'In Progress';
    setRoadmapLoading(true);
    const response = await apiService.updateRoadmapMilestone(item.id, status);
    if (response?.success) await syncRoadmap();
    else {
      setRoadmapLoading(false);
      setRoadmapError(response?.message || 'Unable to update this milestone.');
    }
  };

  // ERR-022 FIX: Deterministic boost calculation based on scenario definitions
  const SCENARIO_BOOSTS = {
    'LeetCode 150': 9,
    'Docker CI/CD': 11,
    'DBMS Indexing': 7,
    'System Design Mini': 12
  };

  const handleSimulateScenario = async (boost, label) => {
    const requestId = ++simulationRequest.current;
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
        if (requestId === simulationRequest.current) setSimulatedBoost(serverSim.totalBoost);
        return;
      }
    } catch {}

    // Deterministic client fallback calculation
    const calculatedBoost = updatedSkills.reduce((acc, skill) => acc + (SCENARIO_BOOSTS[skill] || 5), 0);
    if (requestId === simulationRequest.current) setSimulatedBoost(Math.max(0, Math.min(100 - currentScore, calculatedBoost)));
  };

  const resetSimulation = () => {
    simulationRequest.current += 1;
    setSimulationActive(false);
    setSimulatedBoost(0);
    setSimulatedSkills([]);
  };

  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setResumeError('Paste resume text before analyzing.');
      return;
    }
    if (!localStorage.getItem('skilltwin_token')) {
      setResumeError('Sign in with an account to compare your resume with its saved role requirements.');
      return;
    }
    setIsAnalyzing(true);
    setResumeError('');
    setResumeAnalysis(null);

    try {
      const serverResult = await apiService.scanResumeText(resumeText);
      if (serverResult?.success) {
        setResumeAnalysis({
          matchPercentage: serverResult.matchPercentage,
          roleName: serverResult.roleName,
          summary: serverResult.summary,
          matchedSkills: serverResult.matchedSkills || [],
          strengths: serverResult.strengths,
          gaps: serverResult.gaps,
          recommendedKeywords: serverResult.recommendedKeywords,
          recommendations: serverResult.recommendations
        });
      } else {
        setResumeError(serverResult?.message || 'Unable to analyze this resume right now.');
      }
    } catch {
      setResumeError('Unable to reach the API. Check your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Safe initial for avatar (ERR-031 fix)
  const avatarInitial = (student.name || 'S').trim().charAt(0).toUpperCase() || 'S';

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
                  <span className="badge-sem">{student.semester ? `Semester ${student.semester}` : 'Semester not set'}</span>
                  <span className="badge-status">
                    <Sparkles size={12} /> Profile saved
                  </span>
                </div>
                <div className="profile-meta-row">
                  <span><GraduationCap size={14} /> {student.branch || 'Branch not added'}</span>
                  <span><Building2 size={14} /> {student.college || 'College not added'}</span>
                  <span><Award size={14} /> CGPA: <strong>{student.cgpa || 'Not added'}</strong></span>
                </div>
              </div>
              {!student.demo && <Link className="profile-edit-link" to="/onboarding?edit=1">Edit profile and skills</Link>}
            </div>

            <div className="profile-role-switcher">
              <label>Target Career Role</label>
              <div className="role-select-box"><Target size={16} className="role-icon" /><strong>{student.targetRole || 'Choose a career role'}</strong></div>
              {!student.demo && <Link className="profile-edit-link" to="/onboarding?edit=1">Update role and skills</Link>}
            </div>
          </div>
        </section>

        {localStorage.getItem('skilltwin_token') && (
          <section className="oauth-link-panel" aria-labelledby="oauth-link-title">
            <div>
              <h2 id="oauth-link-title">Sign-in methods</h2>
              <p>Connect Google or Microsoft to this SkillTwin account. Existing accounts are never merged by email alone.</p>
            </div>
            <OAuthButtons mode="link" />
          </section>
        )}

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
                  <strong>{readinessCalculated ? `${effectiveScore}%` : '—'}</strong>
                  <span>{readinessCalculated ? (effectiveScore >= 75 ? 'At displayed target' : 'Building skills') : 'Not calculated yet'}</span>
                </div>
              </div>

              <div className="gauge-insights">
                <div className="insight-row">
                  <span>Profile status</span>
                  <strong className="tier-badge">{readinessCalculated ? (effectiveScore >= 75 ? 'Target met' : 'Target in progress') : 'Awaiting skill ratings'}</strong>
                </div>
                <div className="insight-row">
                  <span>Benchmark</span>
                  <span>Based on saved skill ratings</span>
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
                <h4>{dsaLevel == null ? 'Not rated yet' : `${dsaLevel >= 75 ? 'Advanced' : dsaLevel >= 50 ? 'Intermediate' : 'Foundational'} (${dsaLevel}%)`}</h4>
                <div className="stat-bar-box">
                  <div className="stat-bar-fill" style={{ width: `${dsaLevel || 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-icon-wrapper db">
                <Database size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-title">Databases & Architecture</span>
                <h4>{dbmsLevel == null ? 'Not rated yet' : `${dbmsLevel}% Proficiency`}</h4>
                <div className="stat-bar-box">
                  <div className="stat-bar-fill" style={{ width: `${dbmsLevel || 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-icon-wrapper devops">
                <Cpu size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-title">DevOps & Cloud {devopsLevel != null && devopsLevel < 50 ? '(Gap Area)' : ''}</span>
                <h4 className={devopsLevel != null && devopsLevel < 50 ? "text-warning" : ""}>{devopsLevel == null ? 'Not rated yet' : `${devopsLevel}% ${devopsLevel < 50 ? 'Needs Attention' : 'Proficiency'}`}</h4>
                <div className="stat-bar-box">
                  <div className={`stat-bar-fill ${devopsLevel != null && devopsLevel < 50 ? 'warning' : ''}`} style={{ width: `${devopsLevel || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE WORKSPACE TABS */}
        <section className="dashboard-tabs-section">
          <div className="tabs-navigation" role="tablist" aria-label="Dashboard workspace">
            <button 
              className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'skills'}
              onClick={() => setActiveTab('skills')}
            >
              <BarChart3 size={17} />
              <span>Skill Matrix & Gap Analysis</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'roadmap'}
              onClick={() => setActiveTab('roadmap')}
            >
              <BookOpen size={17} />
              <span>Learning Roadmap</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'assessments'}
              onClick={() => setActiveTab('assessments')}
            >
              <ClipboardCheck size={17} />
              <span>Assessments</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'simulator'}
              onClick={() => setActiveTab('simulator')}
            >
              <TrendingUp size={17} />
              <span>Career Simulator</span>
            </button>

            <button 
              className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'resume'}
              onClick={() => setActiveTab('resume')}
            >
              <FileText size={17} />
              <span>Resume Role Fit</span>
            </button>
          </div>

          <div className="tab-viewport">
            {/* TAB 1: SKILL MATRIX */}
            {activeTab === 'skills' && (
              <div className="tab-pane skills-pane">
                <div className="pane-header">
                  <div>
                    <h2>Role Skill Matrix</h2>
                    <p>These are requirements for {student.targetRole || 'your selected career'}. Your saved skills appear only after you rate and save them.</p>
                    {!student.demo && !student.savedSkills?.length && <div className="onboarding-empty-state">
                      <p>No skills are saved to your profile yet. Add only skills you have practiced; readiness stays uncalculated until then.</p>
                      <Link to="/onboarding?edit=1">Add skills to my profile <ArrowRight size={15} /></Link>
                    </div>}
                    {skillUpdateError && <p className="assessment-error" role="alert">{skillUpdateError}</p>}
                    {student.readinessSummary && (
                      <p className="readiness-gap-summary" role="status">
                        {student.readinessSummary.missingCount} missing skills · {student.readinessSummary.belowTargetCount} below target · {student.readinessSummary.metCount} meeting target
                      </p>
                    )}
                  </div>
                  <div className="legend-pills">
                    <span className="legend-item"><span className="legend-dot current"></span> Your Level</span>
                    <span className="legend-item"><span className="legend-dot required"></span> Placement Target</span>
                  </div>
                </div>

                <div className="skills-interactive-grid">
                  {displayedSkills.map(([name, data]) => {
                    const hasTarget = data.required != null;
                    const isGap = hasTarget && data.current < data.required;
                    return (
                      <div key={name} className={`skill-slider-card ${isGap ? 'has-gap' : 'on-target'}`}>
                        <div className="skill-card-top">
                          <span className="skill-category-tag">{data.category}</span>
                          {!hasTarget ? (
                            <span className="good-tag"><CheckCircle2 size={12} /> Your skill</span>
                          ) : isGap ? (
                            <span className="gap-tag"><AlertCircle size={12} /> {data.missing ? 'Missing' : `Gap: ${data.required - data.current}%`}</span>
                          ) : (
                            <span className="good-tag"><CheckCircle2 size={12} /> Target Met</span>
                          )}
                        </div>

                        <h4>{name}</h4>

                        <div className="skill-numbers">
                          <span>Current: <strong>{data.current}%</strong></span>
                          <span>Target: <strong>{hasTarget ? `${data.required}%` : 'Not in role benchmark'}</strong></span>
                        </div>

                        <div className="dual-progress-bar">
                          {hasTarget && <div className="progress-required-marker" style={{ left: `${data.required}%` }}></div>}
                          <div className="progress-current-fill" style={{ width: `${data.current}%` }}></div>
                        </div>

                        <div className="slider-action-row">
                          <input 
                            type="range" 
                            min="0"
                            max="100" 
                             value={data.current}
                             aria-label={`Set ${name} proficiency`}
                            onChange={async (e) => {
                              const response = await updateSkill?.(name, Number(e.target.value));
                              setSkillUpdateError(response?.success ? '' : response?.message || 'Unable to save this skill.');
                            }}
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
                    <h2>{localStorage.getItem('skilltwin_token') ? `${student.targetRole || 'Career'} Learning Roadmap` : 'Semester 5 Placement Milestone Plan'}</h2>
                    <p>{localStorage.getItem('skilltwin_token') ? 'Ordered learning milestones generated from your role requirements and current skill gaps.' : 'Illustrative demo checklist for exploring the roadmap tools.'}</p>
                  </div>
                  <div className="roadmap-progress-indicator">
                    <span>{roadmapProgress.percentage}% complete · {roadmapProgress.completed} completed · {roadmapProgress.inProgress} in progress · {roadmapProgress.planned} pending</span>
                    <div className="roadmap-progress-track" role="progressbar" aria-label="Roadmap completion" aria-valuenow={roadmapProgress.percentage} aria-valuemin="0" aria-valuemax="100">
                      <div className="roadmap-progress-fill" style={{ width: `${roadmapProgress.percentage}%` }} />
                    </div>
                    {localStorage.getItem('skilltwin_token') && (
                      <button className="roadmap-regenerate-btn" type="button" onClick={() => syncRoadmap(true)} disabled={roadmapLoading}>
                        <RefreshCw size={14} className={roadmapLoading ? 'spin-icon' : ''} />
                        {roadmapLoading ? 'Updating…' : 'Regenerate from skill gaps'}
                      </button>
                    )}
                  </div>
                </div>

                {roadmapError && <p className="assessment-error" role="alert">{roadmapError}</p>}
                {roadmapLoading && !roadmapItems.length && <p className="roadmap-loading" role="status">Building your personalized roadmap…</p>}
                {!roadmapLoading && !roadmapError && !roadmapItems.length && <p className="roadmap-loading">{!readinessCalculated ? 'Save at least one skill rating to build a roadmap from your profile.' : 'There are no open skill gaps for this role yet. Update your skill ratings to refresh this plan.'}</p>}

                <div className="roadmap-timeline">
                  {roadmapItems.map((item, idx) => {
                    const isDone = item.status === 'completed';
                    const isInProgress = item.status === 'in-progress';
                    return (
                      <div key={item.id} className={`roadmap-step-card ${isDone ? 'completed-step' : ''} ${isInProgress ? 'in-progress-step' : ''}`}>
                        <div className="step-timeline-node">
                          <button 
                            className={`node-check-btn ${isDone ? 'checked' : ''}`}
                            onClick={() => handleRoadmapMilestone(item)}
                            disabled={roadmapLoading}
                            title={isDone ? 'Reopen milestone' : isInProgress ? 'Mark milestone as completed' : 'Start milestone'}
                            aria-label={`${isDone ? 'Reopen' : isInProgress ? 'Complete' : 'Start'} ${item.title}`}
                          >
                            {isDone ? <Check size={16} /> : isInProgress ? <Play size={13} /> : <Circle size={16} />}
                          </button>
                          {idx !== roadmapItems.length - 1 && <div className="timeline-connector-line"></div>}
                        </div>

                        <div className="step-content-card">
                          <div className="step-time-badge">{item.week} · {isDone ? 'Completed' : isInProgress ? 'In progress' : 'Pending'}</div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          {item.completedAt && <p className="roadmap-completed-date">Completed {new Date(item.completedAt).toLocaleDateString()}</p>}
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

            {activeTab === 'assessments' && <AssessmentsPanel />}

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

                {!readinessCalculated && <div className="onboarding-empty-state">
                  <p>Readiness scenarios are unavailable until you save skill ratings. Add only skills you have practiced to calculate a starting score.</p>
                  <Link to="/onboarding?edit=1">Add or update skills <ArrowRight size={15} /></Link>
                </div>}

                {readinessCalculated && <div className="simulator-scenarios-grid">
                  <button type="button"
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
                  </button>

                  <button type="button"
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
                  </button>

                  <button type="button"
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
                  </button>

                  <button type="button"
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
                  </button>
                </div>}

                {simulationActive && (
                  <div className="simulation-result-banner">
                    <div className="sim-result-text">
                      <h4>Simulation Active: Readiness jumps from <strong>{currentScore}%</strong> to <span className="highlight-score">{effectiveScore}%</span></h4>
                      <p>This is a rule-based scenario preview. It does not update your saved skill profile or guarantee a placement outcome.</p>
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
                    <h2>Resume Evidence & Role Fit</h2>
                    <p>Compare skills mentioned in your resume with the requirements for your saved target role. Keyword matches are evidence hints, not verified proficiency.</p>
                  </div>
                </div>

                <div className="resume-grid">
                  <div className="resume-input-box">
                    <form onSubmit={handleAnalyzeResume}>
                      <textarea
                        rows="7"
                        placeholder="Paste your resume summary, project details, or tech stack here (e.g. Built a student attendance portal using React, Node.js, and MongoDB with JWT auth...)"
                        value={resumeText}
                        maxLength={20000}
                        onChange={(e) => { setResumeText(e.target.value); setResumeError(''); }}
                        aria-label="Resume text"
                        className="resume-textarea"
                      ></textarea>
                      <div className="resume-character-count">{resumeText.length.toLocaleString()} / 20,000 characters</div>

                      <div className="resume-actions-bar">
                        <button type="submit" className="primary-btn glow-btn" disabled={isAnalyzing}>
                          {isAnalyzing ? (
                            <>
                              <RefreshCw size={16} className="spin-icon" /> Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} /> Analyze Resume
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                    {resumeError && <p className="resume-error" role="alert">{resumeError}</p>}
                  </div>

                  {resumeAnalysis && (
                    <div className="resume-analysis-output">
                      <div className="analysis-score-bar">
                        <span>Role Requirement Mentions · {resumeAnalysis.roleName}</span>
                        <strong>{resumeAnalysis.matchPercentage}%</strong>
                      </div>
                      <p className="resume-match-summary">{resumeAnalysis.summary.matchedSkillCount} of {resumeAnalysis.summary.requiredSkillCount} role skills mentioned; {resumeAnalysis.summary.missingSkillCount} have no matching keyword evidence.</p>

                      <div className="analysis-group">
                        <h5><CheckCircle2 size={15} className="text-success" /> Resume Evidence Found</h5>
                        <ul>
                          {resumeAnalysis.matchedSkills.map((skill) => (
                            <li key={skill.skillId}>{skill.skillName} — evidence: “{skill.evidence}” · {skill.requiredLevel} required</li>
                          ))}
                          {resumeAnalysis.strengths.map((str, i) => <li key={`signal-${i}`}>{str}</li>)}
                          {!resumeAnalysis.matchedSkills.length && <li>No target-role skill keywords were found in this resume text.</li>}
                        </ul>
                      </div>

                      <div className="analysis-group">
                        <h5><AlertCircle size={15} className="text-warning" /> Role Requirements Without Evidence</h5>
                        <ul>
                          {resumeAnalysis.gaps.map((gap, i) => (
                            <li key={i}>{gap}</li>
                          ))}
                        </ul>
                      </div>

                      {resumeAnalysis.recommendedKeywords.length > 0 && <div className="analysis-group">
                        <h5><Target size={15} className="text-cyan" /> Role Skills to Address</h5>
                        <div className="keyword-chips">
                          {resumeAnalysis.recommendedKeywords.map((kw, i) => (
                            <span key={i} className="kw-chip">{kw}</span>
                          ))}
                        </div>
                      </div>}
                      {resumeAnalysis.recommendations.length > 0 && <div className="analysis-group">
                        <h5>Suggestions</h5>
                        <ul>{resumeAnalysis.recommendations.map((item, i) => <li key={i}>{item}</li>)}</ul>
                      </div>}
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
