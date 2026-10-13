import axios from 'axios';

// Same-origin by default: production proxies /api to the backend, while Vite
// proxies /api to the local backend during development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
  // Distinguish HTTP authentication errors from transport failures. A failed
  // connection must never be treated as a successful account login.
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
      return { success: false, message: 'Unable to reach SkillTwin. Check your connection and try again.' };
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
      return { success: false, message: 'Unable to reach SkillTwin. Check your connection and try again.' };
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

  getCareerReadiness: async () => {
    try {
      const response = await apiClient.get('/student/gaps');
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

  scanResumeText: async (resumeText) => {
    try {
      const response = await apiClient.post('/ai/analyze-resume', { resumeText });
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to analyze this resume right now.' };
    }
  },

  getAssessments: async () => {
    try {
      const response = await apiClient.get('/assessments');
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to load assessments.' };
    }
  },

  getAssessment: async (assessmentId) => {
    try {
      const response = await apiClient.get(`/assessments/${assessmentId}`);
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to load this assessment.' };
    }
  },

  submitAssessment: async (assessmentId, answers) => {
    try {
      const response = await apiClient.post(`/assessments/${assessmentId}/submit`, { answers });
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to submit assessment.' };
    }
  },

  getAssessmentResults: async () => {
    try {
      const response = await apiClient.get('/assessments/results');
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to load assessment history.' };
    }
  },

  getLearningRoadmap: async () => {
    try {
      const response = await apiClient.get('/roadmap');
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to load your learning roadmap.' };
    }
  },

  getLearningProgress: async () => {
    try {
      const response = await apiClient.get('/roadmap/progress');
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to load your progress.' };
    }
  },

  generateLearningRoadmap: async () => {
    try {
      const response = await apiClient.post('/roadmap/generate');
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to generate your learning roadmap.' };
    }
  },

  updateRoadmapMilestone: async (milestoneId, status) => {
    try {
      const response = await apiClient.put(`/roadmap/milestones/${milestoneId}`, { status });
      return response.data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to update this milestone.' };
    }
  },

};
