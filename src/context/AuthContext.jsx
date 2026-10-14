import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_DEMO_STUDENT = {
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

const normalizeUser = (user) => ({
  ...DEFAULT_DEMO_STUDENT,
  ...user,
  accountRole: user?.accountRole === 'admin' ? 'admin' : 'student',
  skills: user?.skills && typeof user.skills === 'object' ? { ...user.skills } : {},
  completedMilestones: Array.isArray(user?.completedMilestones) ? user.completedMilestones : []
});

export function AuthProvider({ children }) {
  const skillUpdateTimers = useRef(new Map());
  const skillUpdateResolvers = useRef(new Map());
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('skilltwin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ERR-020: Sync storage cleanly
  useEffect(() => {
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
        setUser(previous => previous ? normalizeUser({
          ...previous,
          id: profile.user_id,
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          college: profile.college,
          branch: profile.branch,
          semester: String(profile.semester),
          targetRole: profile.target_role,
          cgpa: profile.cgpa,
          readinessScore: Number(profile.readiness_score || 0),
          accountRole: profile.account_role,
          graduationYear: profile.graduation_year
        }) : previous);
      }
    });
    return () => { active = false; };
  }, []);

  // ERR-012 FIX: Distinguish real server rejection from server-offline fallback
  const login = async (email, password) => {
    const apiRes = await apiService.login(email, password);
    
    // Success from backend
    if (apiRes && apiRes.success && apiRes.user && apiRes.token) {
      localStorage.setItem('skilltwin_token', apiRes.token);
      setUser(normalizeUser(apiRes.user));
      return { success: true };
    }

    // Backend explicitly returned an error (e.g. 401 Invalid Credentials)
    if (apiRes && apiRes.success === false) {
      return { success: false, message: apiRes.message || 'Invalid email or password' };
    }

    return { success: false, message: apiRes?.message || 'Unable to sign in right now. Please try again.' };
  };

  const loginDemo = async () => {
    localStorage.removeItem('skilltwin_token');
    setUser(DEFAULT_DEMO_STUDENT);
    return { success: true };
  };

  // ERR-013 FIX: Distinguish server conflict/validation error from offline fallback
  const signup = async ({ name, email, semester, branch, targetRole, password }) => {
    const apiRes = await apiService.register({
      name,
      email,
      semester,
      branch,
      targetRole,
      password
    });

    if (apiRes && apiRes.success && apiRes.user && apiRes.token) {
      localStorage.setItem('skilltwin_token', apiRes.token);
      setUser(normalizeUser(apiRes.user));
      return { success: true };
    }

    if (apiRes && apiRes.success === false) {
      return { success: false, message: apiRes.message || 'Registration failed' };
    }

    return { success: false, message: apiRes?.message || 'Unable to create your account right now. Please try again.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skilltwin_user');
    localStorage.removeItem('skilltwin_token');
  };

  // ERR-015 FIX: Sync target role using dedicated updateTargetRole API endpoint
  const updateTargetRole = async (newRole) => {
    if (!user) return;
    if (!localStorage.getItem('skilltwin_token')) {
      setUser(prev => ({ ...prev, targetRole: newRole }));
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
    const data = await apiService.getCareerReadiness();
    if (!data?.success) return null;
    setUser(prev => prev ? ({
      ...prev,
      targetRole: data.targetRole?.name || prev.targetRole,
      readinessScore: data.readinessScore,
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
      login,
      loginDemo,
      signup,
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
