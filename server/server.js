import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend requests during development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-student-id']
}));

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SkillTwin AI API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 SkillTwin AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Endpoints: /api/auth/login, /api/auth/register, /api/auth/demo`);
  console.log(`📊 Student Endpoints: /api/student/profile, /api/student/skills`);
  console.log(`🧠 AI Endpoints: /api/ai/simulate, /api/ai/analyze-resume`);
  console.log(`==============================================\n`);
});
