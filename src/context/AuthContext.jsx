import { createContext, useContext, useState, useEffect } from 'react';
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

export function AuthProvider({ children }) {
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

  // ERR-012 FIX: Distinguish real server rejection from server-offline fallback
  const login = async (email, password) => {
    const apiRes = await apiService.login(email, password);
    
    // Success from backend
    if (apiRes && apiRes.success && apiRes.user) {
      if (apiRes.token) {
        localStorage.setItem('skilltwin_token', apiRes.token);
      }
      setUser(apiRes.user);
      return { success: true };
    }

    // Backend explicitly returned an error (e.g. 401 Invalid Credentials)
    if (apiRes && apiRes.success === false) {
      return { success: false, message: apiRes.message || 'Invalid email or password' };
    }

    // Fallback ONLY when backend is completely offline (apiRes === null)
    const studentUser = {
      ...DEFAULT_DEMO_STUDENT,
      email: email || DEFAULT_DEMO_STUDENT.email,
      name: email ? email.split('@')[0].replace('.', ' ') : DEFAULT_DEMO_STUDENT.name
    };
    setUser(studentUser);
    return { success: true, offlineFallback: true };
  };

  const loginDemo = async () => {
    try {
      const apiRes = await apiService.login('sanjay.cse@student.edu', 'password123');
      if (apiRes && apiRes.success && apiRes.user) {
        if (apiRes.token) localStorage.setItem('skilltwin_token', apiRes.token);
        setUser(apiRes.user);
        return { success: true };
      }
    } catch {}

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
      password: password || 'password123'
    });

    if (apiRes && apiRes.success && apiRes.user) {
      if (apiRes.token) localStorage.setItem('skilltwin_token', apiRes.token);
      setUser(apiRes.user);
      return { success: true };
    }

    if (apiRes && apiRes.success === false) {
      return { success: false, message: apiRes.message || 'Registration failed' };
    }

    // Fallback ONLY if backend is completely offline
    const newUser = {
      ...DEFAULT_DEMO_STUDENT,
      id: 'student-' + Date.now(),
      name: name || 'CSE Student',
      email: email,
      semester: semester || '5',
      branch: branch || 'Computer Science & Engineering',
      targetRole: targetRole || 'Software Developer'
    };
    setUser(newUser);
    return { success: true, offlineFallback: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skilltwin_user');
    localStorage.removeItem('skilltwin_token');
  };

  // ERR-015 FIX: Sync target role using dedicated updateTargetRole API endpoint
  const updateTargetRole = async (newRole) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      targetRole: newRole
    }));
    try {
      await apiService.updateTargetRole(newRole);
    } catch {}
  };

  // ERR-023 FIX: Avoid score inflation past benchmark where individual over-achieved skill compensates 0% gap
  const updateSkill = async (skillName, newLevel) => {
    if (!user) return;

    setUser(prev => {
      const updatedSkills = {
        ...prev.skills,
        [skillName]: {
          ...prev.skills[skillName],
          current: newLevel
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

      return {
        ...prev,
        skills: updatedSkills,
        readinessScore: newScore
      };
    });

    try {
      await apiService.updateSkillLevel(skillName, newLevel);
    } catch {}
  };

  const toggleMilestone = async (milestoneId) => {
    if (!user) return;

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

    try {
      await apiService.toggleMilestoneStatus(milestoneId);
    } catch {}
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
      toggleMilestone
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
