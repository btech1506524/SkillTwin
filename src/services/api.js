import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create Axios instance with timeout and JSON headers
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
});

// Attach Authorization Bearer token if present
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
  // Auth
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      console.warn('Backend offline, using fallback auth:', err.message);
      return null;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (err) {
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
