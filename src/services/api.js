import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // ERR-035: Increased timeout from 4000ms to 15000ms to accommodate AI endpoints
  timeout: 15000
});

// Attach Authorization Bearer token and student-id header if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('skilltwin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const user = localStorage.getItem('skilltwin_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.id) {
        config.headers['x-student-id'] = parsed.id;
      }
    } catch {}
  }
  return config;
});

// API Service Methods
export const apiService = {
  // AUTH
  // ERR-012 FIX: Distinguishes between network failures (backend offline → return null)
  // and HTTP errors (backend online but auth failed → return { success: false, message })
  // This lets AuthContext decide whether to show an error or use the demo fallback.
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      if (err.response) {
        // Backend is reachable but returned an error (401, 409, etc.)
        return {
          success: false,
          message: err.response.data?.message || 'Invalid credentials.'
        };
      }
      // Network error — backend may be offline; caller can use demo fallback
      console.warn('Backend offline, using fallback auth:', err.message);
      return null;
    }
  },

  // ERR-013 FIX: Same distinction as login — null means offline, object means server error
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      if (err.response) {
        return {
          success: false,
          message: err.response.data?.message || 'Registration failed.'
        };
      }
      console.warn('Backend offline, using fallback registration:', err.message);
      return null;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/student/profile');
      return response.data;
    } catch (err) {
      return null;
    }
  },

  updateSkillLevel: async (skillName, currentLevel) => {
    try {
      const response = await apiClient.put('/student/skills', { skillName, currentLevel });
      return response.data;
    } catch (err) {
      return null;
    }
  },

  // ERR-015 FIX: Added the correct target-role API call (was missing before)
  updateTargetRole: async (targetRole) => {
    try {
      const response = await apiClient.put('/student/target-role', { targetRole });
      return response.data;
    } catch (err) {
      return null;
    }
  },

  toggleMilestoneStatus: async (milestoneId) => {
    try {
      const response = await apiClient.put('/student/milestones', { milestoneId });
      return response.data;
    } catch (err) {
      return null;
    }
  },

  simulateCareerBoost: async (currentScore, addedSkills, targetRole) => {
    try {
      const response = await apiClient.post('/ai/simulate', { currentScore, addedSkills, targetRole });
      return response.data;
    } catch (err) {
      return null;
    }
  },

  scanResumeText: async (resumeText, targetRole) => {
    try {
      const response = await apiClient.post('/ai/analyze-resume', { resumeText, targetRole });
      return response.data;
    } catch (err) {
      return null;
    }
  }
};
