import express from 'express';
import { DB } from '../data/store.js';

const router = express.Router();

// Helper to find student (by header user or fallback to demo student)
function getStudent(req) {
  const userId = req.headers['x-student-id'];
  if (userId) {
    const found = DB.users.find(u => u.id === userId);
    if (found) return found;
  }
  return DB.users[0];
}

// GET /api/student/profile
router.get('/profile', (req, res) => {
  const student = getStudent(req);
  const { passwordHash: _, ...safeStudent } = student;
  res.json({ success: true, student: safeStudent });
});

// PUT /api/student/skills
router.put('/skills', (req, res) => {
  const { skillName, currentLevel } = req.body;
  const student = getStudent(req);

  if (!skillName || currentLevel === undefined) {
    return res.status(400).json({ success: false, message: 'Skill name and current level required.' });
  }

  if (student.skills[skillName]) {
    student.skills[skillName].current = Math.min(100, Math.max(0, parseInt(currentLevel)));
  }

  // Recalculate twin readiness score
  const totalCurrent = Object.values(student.skills).reduce((acc, s) => acc + s.current, 0);
  const totalRequired = Object.values(student.skills).reduce((acc, s) => acc + s.required, 0);
  student.readinessScore = Math.min(100, Math.round((totalCurrent / totalRequired) * 100));

  res.json({
    success: true,
    message: `Updated ${skillName} to ${currentLevel}%.`,
    skills: student.skills,
    readinessScore: student.readinessScore
  });
});

// PUT /api/student/milestones
router.put('/milestones', (req, res) => {
  const { milestoneId } = req.body;
  const student = getStudent(req);

  if (!milestoneId) {
    return res.status(400).json({ success: false, message: 'Milestone ID is required.' });
  }

  if (!student.completedMilestones) {
    student.completedMilestones = [];
  }

  const exists = student.completedMilestones.includes(milestoneId);
  if (exists) {
    student.completedMilestones = student.completedMilestones.filter(m => m !== milestoneId);
  } else {
    student.completedMilestones.push(milestoneId);
  }

  res.json({
    success: true,
    message: exists ? 'Milestone unmarked.' : 'Milestone marked as completed!',
    completedMilestones: student.completedMilestones
  });
});

// PUT /api/student/target-role
router.put('/target-role', (req, res) => {
  const { targetRole } = req.body;
  const student = getStudent(req);

  if (!targetRole) {
    return res.status(400).json({ success: false, message: 'Target role is required.' });
  }

  student.targetRole = targetRole;

  res.json({
    success: true,
    message: `Target career goal updated to ${targetRole}.`,
    targetRole: student.targetRole
  });
});

export default router;
