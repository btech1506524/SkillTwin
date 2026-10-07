import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import aiRoutes from './routes/ai.js';

// Load environment variables first
dotenv.config();

// ERR-042 FIX: Validate JWT_SECRET at startup — fail fast rather than using a silent fallback
if (!process.env.JWT_SECRET) {
  console.error('\n❌ FATAL: JWT_SECRET is not set in server/.env');
  console.error('   Create server/.env with: JWT_SECRET=<your_random_secret>');
  console.error('   Generate one: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ERR-016 FIX: Restrict CORS to the configured frontend origin instead of '*'
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
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
  console.log(`🔑 Auth: /api/auth/login, /api/auth/register, /api/auth/demo`);
  console.log(`📊 Student: /api/student/profile, /api/student/skills, /api/student/target-role`);
  console.log(`🧠 AI: /api/ai/simulate, /api/ai/analyze-resume`);
  console.log(`==============================================\n`);
});
