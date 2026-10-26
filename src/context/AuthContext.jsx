import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);
const DEMO_STORAGE_KEY = 'skilltwin_demo_user';

const DEMO_STUDENT = {
  demo: true,
  id: 'student-sem5-01',
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

const DEMO_ROLE_PROFILES = {
  'Software Developer': {
    readinessScore: 68,
    roadmap: [
      ['Advanced DSA & Graph Theory', 'Master BFS/DFS, shortest paths (Dijkstra), and dynamic programming patterns.', ['Graphs', 'Recursion', 'DP']],
      ['DBMS Deep Dive & Query Optimization', 'Transactions, ACID compliance, B+ Tree indexing, and normal forms.', ['SQL', 'Indexes', 'Transactions']],
      ['Industry Capstone: Full Stack Microservice', 'Build a full stack project with JWT authentication and Docker deployment.', ['React', 'Node.js', 'Docker']],
      ['Placement Mock Rounds & System Design', 'Practice architecture, caching, rate limiting, and technical interviews.', ['System Design', 'Mock Interview', 'CS Core']]
    ]
  },
  'Frontend Developer': {
    readinessScore: 66,
    skills: {
      HTML: { current: 82, required: 75, category: 'Frontend' }, CSS: { current: 70, required: 75, category: 'Frontend' },
      JavaScript: { current: 64, required: 75, category: 'Frontend' }, 'React.js & Frontend': { current: 72, required: 75, category: 'Development' },
      'Web Accessibility': { current: 45, required: 50, category: 'Quality' }, 'Frontend Testing': { current: 35, required: 50, category: 'Quality' }
    },
    roadmap: [['Accessible UI foundations', 'Build responsive, keyboard-friendly interfaces with semantic HTML.', ['HTML', 'CSS', 'Accessibility']], ['React testing workflow', 'Add component and browser tests for a small React feature.', ['React', 'Testing']]]
  },
  'Backend Developer': {
    readinessScore: 61,
    skills: {
      'Node.js and Express.js': { current: 65, required: 50, category: 'Backend' }, 'REST APIs': { current: 60, required: 50, category: 'Backend' },
      'Database Design': { current: 52, required: 50, category: 'Database' }, 'Authentication and Authorization': { current: 38, required: 50, category: 'Security' },
      'API Testing': { current: 30, required: 25, category: 'Quality' }, 'Backend Security': { current: 25, required: 50, category: 'Security' }
    },
    roadmap: [['Secure API foundations', 'Design authenticated endpoints with validation and ownership checks.', ['REST APIs', 'Auth', 'Validation']], ['Database-backed service', 'Model and test a reliable service with migrations and transactions.', ['Database', 'Testing']]]
  },
  'Full Stack Developer': {
    readinessScore: 64,
    skills: {
      HTML: { current: 78, required: 50, category: 'Frontend' }, JavaScript: { current: 62, required: 50, category: 'Frontend' },
      'React.js & Frontend': { current: 58, required: 50, category: 'Development' }, 'Node.js and Express.js': { current: 54, required: 50, category: 'Backend' },
      'REST APIs': { current: 48, required: 50, category: 'Backend' }, 'Database Design': { current: 42, required: 50, category: 'Database' },
      'Cloud Platforms & Deployment': { current: 25, required: 25, category: 'DevOps' }
    },
    roadmap: [['End-to-end product slice', 'Ship a small feature from accessible UI through a tested API and database.', ['React', 'REST APIs', 'Database']], ['Production delivery', 'Containerize and deploy the app with health checks and secure configuration.', ['Docker', 'Cloud', 'Security']]]
  },
  'Data Analyst': {
    readinessScore: 59,
    skills: {
      Python: { current: 60, required: 50, category: 'Analytics' }, 'Statistics & Data Analysis': { current: 48, required: 50, category: 'Analytics' },
      'Data Cleaning': { current: 42, required: 50, category: 'Analytics' }, 'Data Visualization': { current: 55, required: 50, category: 'Analytics' },
      'Excel and Spreadsheets': { current: 68, required: 25, category: 'Analytics' }, 'DBMS & SQL Queries': { current: 45, required: 50, category: 'Database' }
    },
    roadmap: [['Reliable analysis workflow', 'Clean, validate, and query a dataset before drawing conclusions.', ['Python', 'SQL', 'Data Cleaning']], ['Communicate findings', 'Build a clear dashboard and explain the evidence behind recommendations.', ['Visualization', 'Statistics']]]
  },
  'AI / ML Engineer': {
    readinessScore: 56,
    skills: {
      Python: { current: 62, required: 50, category: 'AI / ML' }, 'Statistics & Data Analysis': { current: 44, required: 50, category: 'Analytics' },
      'Machine Learning': { current: 38, required: 50, category: 'AI / ML' }, 'Data Preprocessing': { current: 40, required: 50, category: 'AI / ML' },
      'Model Evaluation': { current: 32, required: 50, category: 'AI / ML' }, 'Linear Algebra Fundamentals': { current: 28, required: 25, category: 'Mathematics' }
    },
    roadmap: [['Modeling foundations', 'Practice preprocessing, baseline models, and evaluation on a documented dataset.', ['Python', 'Preprocessing', 'Evaluation']], ['Applied ML project', 'Build an end-to-end experiment and communicate limitations clearly.', ['ML', 'Statistics', 'Communication']]]
  }
};

function cloneDemoValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createDemoStudent(role = 'Software Developer') {
  const selectedRole = DEMO_ROLE_PROFILES[role] ? role : 'Software Developer';
  const profile = DEMO_ROLE_PROFILES[selectedRole];
  const roadmap = profile.roadmap.map(([title, description, skills], index) => ({
    id: `milestone-${index + 1}`,
    week: `Weeks ${index * 2 + 1} - ${index * 2 + 2}`,
    title,
    description,
    skills,
    status: index < 2 ? 'in-progress' : 'pending'
  }));
  return {
    ...cloneDemoValue(DEMO_STUDENT), targetRole: selectedRole, readinessScore: profile.readinessScore,
    skills: cloneDemoValue(profile.skills || DEMO_STUDENT.skills), completedMilestones: ['milestone-1', 'milestone-2'], demoRoadmap: roadmap
  };
}

const normalizeUser = (user) => ({
  ...user,
  id: user?.id ?? null,
  name: user?.name || '',
  email: user?.email || '',
  semester: user?.semester == null ? '' : String(user.semester),
  branch: user?.branch || '',
  college: user?.college || '',
  cgpa: user?.cgpa == null ? '' : String(user.cgpa),
  targetRole: user?.targetRole || '',
  readinessScore: user?.readinessScore == null ? null : Number(user.readinessScore),
  onboardingComplete: Boolean(user?.onboardingComplete),
  accountRole: user?.accountRole === 'admin' ? 'admin' : 'student',
  skills: user?.skills && typeof user.skills === 'object' ? { ...user.skills } : {},
  savedSkills: Array.isArray(user?.savedSkills) ? user.savedSkills : Object.entries(user?.skills || {})
    .filter(([, skill]) => skill && !skill.missing)
    .map(([skillName, skill]) => ({ skillName, current: Number(skill.current), category: skill.category || '' })),
  completedMilestones: Array.isArray(user?.completedMilestones) ? user.completedMilestones : []
});

function readStoredDemo() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || 'null');
    if (!saved?.demo || typeof saved.targetRole !== 'string') return null;
    return normalizeUser({ ...createDemoStudent(saved.targetRole), ...saved, skills: saved.skills });
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const skillUpdateTimers = useRef(new Map());
  const skillUpdateResolvers = useRef(new Map());
  const [user, setUser] = useState(() => {
    try {
      if (!localStorage.getItem('skilltwin_token')) {
        return sessionStorage.getItem('skilltwin_demo_mode') === 'true' ? (readStoredDemo() || createDemoStudent()) : null;
      }
      const saved = localStorage.getItem('skilltwin_user');
      return saved ? normalizeUser(JSON.parse(saved)) : null;
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(() => !localStorage.getItem('skilltwin_token'));

  // ERR-020: Sync storage cleanly
  useEffect(() => {
    if (user?.demo) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
      localStorage.removeItem('skilltwin_user');
      localStorage.removeItem('skilltwin_token');
      return;
    }
    if (user) {
      localStorage.setItem('skilltwin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skilltwin_user');
      localStorage.removeItem('skilltwin_token');
    }
  }, [user]);

  useEffect(() => {
    if (!localStorage.getItem('skilltwin_token')) return undefined;
    let active = true;
    apiService.getProfile().then(response => {
      if (!active || !response) return;
      if (!response.success && [401, 404].includes(response.status)) {
        localStorage.removeItem('skilltwin_token');
        localStorage.removeItem('skilltwin_user');
        setUser(null);
        return;
      }
      const profile = response.user;
      if (response.success && profile) {
        setUser(previous => normalizeUser({
          ...(previous || {}),
          id: profile.user_id,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          college: profile.college,
          branch: profile.branch,
          semester: String(profile.semester),
          targetRole: profile.target_role,
          cgpa: profile.cgpa,
          readinessScore: Number(profile.skill_count || 0) > 0 ? Number(profile.readiness_score || 0) : null,
          accountRole: profile.account_role,
          graduationYear: profile.graduation_year,
          onboardingComplete: Boolean(profile.onboarding_completed_at)
        }));
      }
    }).finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  // ERR-012 FIX: Distinguish real server rejection from server-offline fallback
  const login = async (email, password) => {
    const apiRes = await apiService.login(email, password);
    
    // Success from backend
    if (apiRes && apiRes.success && apiRes.user && apiRes.token) {
      localStorage.setItem('skilltwin_token', apiRes.token);
      sessionStorage.removeItem('skilltwin_demo_mode');
      setUser(normalizeUser(apiRes.user));
      setAuthReady(true);
      return { success: true, onboardingComplete: Boolean(apiRes.user.onboardingComplete) };
    }

    // Backend explicitly returned an error (e.g. 401 Invalid Credentials)
    if (apiRes && apiRes.success === false) {
      return { success: false, message: apiRes.message || 'Invalid email or password' };
    }

    return { success: false, message: apiRes?.message || 'Unable to sign in right now. Please try again.' };
  };

  const completeOAuthLogin = async (code) => {
    const apiRes = await apiService.exchangeOAuthCode(code);
    if (!apiRes?.success || !apiRes.user || !apiRes.token) {
      return { success: false, message: apiRes?.message || 'Unable to complete sign-in. Please try again.' };
    }
    localStorage.setItem('skilltwin_token', apiRes.token);
    sessionStorage.removeItem('skilltwin_demo_mode');
    setUser(normalizeUser(apiRes.user));
    setAuthReady(true);
    return { success: true, onboardingComplete: Boolean(apiRes.user.onboardingComplete) };
  };

  const loginDemo = async () => {
    localStorage.removeItem('skilltwin_token');
    localStorage.removeItem('skilltwin_user');
    sessionStorage.setItem('skilltwin_demo_mode', 'true');
    setUser(readStoredDemo() || createDemoStudent());
    return { success: true };
  };

  // ERR-013 FIX: Distinguish server conflict/validation error from offline fallback
  const signup = async ({ name, email, password }) => {
    const apiRes = await apiService.register({
      name,
      email,
      password
    });

    if (apiRes && apiRes.success && apiRes.user && apiRes.token) {
      localStorage.setItem('skilltwin_token', apiRes.token);
      sessionStorage.removeItem('skilltwin_demo_mode');
      setUser(normalizeUser(apiRes.user));
      setAuthReady(true);
      return { success: true, onboardingComplete: Boolean(apiRes.user.onboardingComplete) };
    }

    if (apiRes && apiRes.success === false) {
      return { success: false, message: apiRes.message || 'Registration failed' };
    }

    return { success: false, message: apiRes?.message || 'Unable to create your account right now. Please try again.' };
  };

  const logout = () => {
    const wasDemo = user?.demo;
    setUser(null);
    localStorage.removeItem('skilltwin_user');
    localStorage.removeItem('skilltwin_token');
    if (wasDemo) localStorage.removeItem(DEMO_STORAGE_KEY);
    sessionStorage.removeItem('skilltwin_demo_mode');
  };

  const finishOnboarding = async () => {
    const response = await apiService.getProfile();
    if (response?.success && response.user) {
      const profile = response.user;
      setUser(previous => previous ? normalizeUser({
        ...previous,
        id: profile.user_id,
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        college: profile.college,
        branch: profile.branch,
        semester: profile.semester,
        targetRole: profile.target_role,
        cgpa: profile.cgpa,
        graduationYear: profile.graduation_year,
        readinessScore: profile.skill_count ? Number(profile.readiness_score || 0) : null,
        onboardingComplete: Boolean(profile.onboarding_completed_at)
      }) : previous);
    }
    await refreshCareerReadiness();
  };

  // ERR-015 FIX: Sync target role using dedicated updateTargetRole API endpoint
  const updateTargetRole = async (newRole) => {
    if (!user) return;
    if (!localStorage.getItem('skilltwin_token')) {
      if (!user.demo) return { success: false, message: 'Sign in to save profile changes.' };
      setUser(prev => {
        const next = createDemoStudent(newRole);
        return { ...next, completedMilestones: prev.completedMilestones || next.completedMilestones };
      });
      return { success: true, demo: true };
    }
    try {
      const response = await apiService.updateTargetRole(newRole);
      if (response?.success) {
        setUser(prev => ({ ...prev, targetRole: newRole }));
        await refreshCareerReadiness();
      }
      return response;
    } catch {}
    return { success: false, message: 'Unable to update your target role. Please try again.' };
  };

  const refreshCareerReadiness = useCallback(async () => {
    if (!localStorage.getItem('skilltwin_token')) return null;
    const [data, saved] = await Promise.all([apiService.getCareerReadiness(), apiService.getStudentSkills()]);
    if (!data?.success) return null;
    setUser(prev => prev ? ({
      ...prev,
      targetRole: data.targetRole?.name || prev.targetRole,
      readinessScore: data.readinessScore,
      savedSkills: saved?.success ? saved.skills.map(skill => ({
        skillId: skill.skill_id,
        skillName: skill.skill_name,
        current: Number(skill.proficiency_score),
        category: skill.category,
        yearsExperience: Number(skill.years_experience || 0)
      })) : prev.savedSkills,
      skills: Object.fromEntries(data.skills.map(skill => [skill.skillName, {
        current: skill.current,
        required: skill.required,
        category: skill.category,
        missing: skill.missing
      }])),
      skillGaps: data.gaps,
      readinessSummary: {
        totalRequiredSkills: data.totalRequiredSkills,
        missingCount: data.missingCount,
        belowTargetCount: data.belowTargetCount,
        metCount: data.metCount
      }
    }) : prev);
    return data;
  }, []);

  // ERR-023 FIX: Avoid score inflation past benchmark where individual over-achieved skill compensates 0% gap
  const updateSkill = async (skillName, newLevel) => {
    if (!user) return;

    if (localStorage.getItem('skilltwin_token')) {
      return new Promise(resolve => {
        const resolvers = skillUpdateResolvers.current.get(skillName) || [];
        resolvers.push(resolve);
        skillUpdateResolvers.current.set(skillName, resolvers);
        clearTimeout(skillUpdateTimers.current.get(skillName));
        skillUpdateTimers.current.set(skillName, setTimeout(async () => {
          skillUpdateTimers.current.delete(skillName);
          skillUpdateResolvers.current.delete(skillName);
          let response;
          try {
            response = await apiService.updateSkillLevel(skillName, newLevel);
            if (response?.success) await refreshCareerReadiness();
          } catch {
            response = { success: false, message: 'Unable to save this skill. Please try again.' };
          }
          resolvers.forEach(resolveUpdate => resolveUpdate(response));
        }, 300));
      });
    }

    if (!user.demo) return { success: false, message: 'Sign in to save skill changes.' };

    setUser(prev => {
      const updatedSkills = {
        ...prev.skills,
        [skillName]: {
          ...prev.skills[skillName],
          current: newLevel,
          missing: false
        }
      };

      // Cap per-skill contribution at its required value so surplus doesn't hide deficits
      const effectiveCurrentSum = Object.values(updatedSkills).reduce(
        (acc, s) => acc + Math.min(s.current, s.required),
        0
      );
      const totalRequired = Object.values(updatedSkills).reduce((acc, s) => acc + s.required, 0);
      const newScore = totalRequired > 0 
        ? Math.min(100, Math.round((effectiveCurrentSum / totalRequired) * 100))
        : 0;
      const skillEntries = Object.entries(updatedSkills);
      const missingCount = skillEntries.filter(([, skill]) => skill.missing).length;
      const belowTargetCount = skillEntries.filter(([, skill]) => !skill.missing && skill.current < skill.required).length;
      const metCount = skillEntries.length - missingCount - belowTargetCount;

      return {
        ...prev,
        skills: updatedSkills,
        readinessScore: newScore,
        skillGaps: skillEntries
          .filter(([, skill]) => skill.missing || skill.current < skill.required)
          .map(([name, skill]) => ({ skillName: name, current: skill.current, required: skill.required, missing: skill.missing })),
        readinessSummary: {
          ...(prev.readinessSummary || {}),
          totalRequiredSkills: skillEntries.length,
          missingCount,
          belowTargetCount,
          metCount
        }
      };
    });

  };

  const toggleMilestone = async (milestoneId) => {
    if (!user) return;
    if (!localStorage.getItem('skilltwin_token') && !user.demo) return { success: false, message: 'Sign in to save roadmap progress.' };

    const previous = user.completedMilestones || [];

    setUser(prev => {
      const exists = prev.completedMilestones?.includes(milestoneId);
      const updated = exists
        ? prev.completedMilestones.filter(m => m !== milestoneId)
        : [...(prev.completedMilestones || []), milestoneId];
      return {
        ...prev,
        completedMilestones: updated
      };
    });

    if (!localStorage.getItem('skilltwin_token')) return;

    try {
      const response = await apiService.toggleMilestoneStatus(milestoneId);
      if (!response?.success) setUser(prevUser => ({ ...prevUser, completedMilestones: previous }));
    } catch { setUser(prevUser => ({ ...prevUser, completedMilestones: previous })); }
  };

  return (
    <AuthContext.Provider value={{
      user,
      authReady,
      login,
      completeOAuthLogin,
      loginDemo,
      signup,
      finishOnboarding,
      logout,
      updateTargetRole,
      updateSkill,
      toggleMilestone,
      refreshCareerReadiness
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
