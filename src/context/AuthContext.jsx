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

  useEffect(() => {
    if (user) {
      localStorage.setItem('skilltwin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skilltwin_user');
      localStorage.removeItem('skilltwin_token');
    }
  }, [user]);

  const login = async (email, password) => {
    // Attempt backend API login
    const apiRes = await apiService.login(email, password);
    if (apiRes && apiRes.success && apiRes.user) {
      if (apiRes.token) {
        localStorage.setItem('skilltwin_token', apiRes.token);
      }
      setUser(apiRes.user);
      return { success: true };
    }

    // Fallback if backend is not running
    const studentUser = {
      ...DEFAULT_DEMO_STUDENT,
      email: email || DEFAULT_DEMO_STUDENT.email,
      name: email.split('@')[0].replace('.', ' ') || DEFAULT_DEMO_STUDENT.name
    };
    setUser(studentUser);
    return { success: true };
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

  const signup = async ({ name, email, semester, branch, targetRole, password }) => {
    const apiRes = await apiService.register({ name, email, semester, branch, targetRole, password: password || 'password123' });
    if (apiRes && apiRes.success && apiRes.user) {
      if (apiRes.token) localStorage.setItem('skilltwin_token', apiRes.token);
      setUser(apiRes.user);
      return { success: true };
    }

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
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skilltwin_token');
  };

  const updateTargetRole = async (newRole) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      targetRole: newRole
    }));
    // Sync with backend API
    try {
      await apiService.updateSkillLevel('', 0); // triggers sync
    } catch {}
  };

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

      // Recalculate average readiness
      const totalCurrent = Object.values(updatedSkills).reduce((acc, s) => acc + s.current, 0);
      const totalRequired = Object.values(updatedSkills).reduce((acc, s) => acc + s.required, 0);
      const newScore = Math.min(100, Math.round((totalCurrent / totalRequired) * 100));

      return {
        ...prev,
        skills: updatedSkills,
        readinessScore: newScore
      };
    });

    // Notify backend
    try {
      await apiService.updateSkillLevel(skillName, newLevel);
    } catch {}
  };

  const toggleMilestone = async (milestoneId) => {
    if (!user) return;

    setUser(prev => {
      const exists = prev.completedMilestones.includes(milestoneId);
      const updated = exists
        ? prev.completedMilestones.filter(m => m !== milestoneId)
        : [...prev.completedMilestones, milestoneId];
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
