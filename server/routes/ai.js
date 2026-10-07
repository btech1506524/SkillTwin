import express from 'express';
import { DB } from '../data/store.js';

const router = express.Router();

// Knowledge base of placement keywords & required skills for CSE
const TECH_KEYWORDS = [
  'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'MySQL', 'PostgreSQL',
  'Java', 'C++', 'Python', 'Data Structures', 'Algorithms', 'OOP', 'Git',
  'Docker', 'Kubernetes', 'REST API', 'GraphQL', 'Linux', 'AWS', 'Azure',
  'CI/CD', 'Redis', 'Unit Testing', 'Jest', 'System Design', 'Microservices',
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'DBMS', 'Operating Systems', 'Networks'
];

// POST /api/ai/simulate
router.post('/simulate', (req, res) => {
  const { currentScore, addedSkills = [], targetRole = 'Software Developer' } = req.body;

  let totalBoost = 0;
  const breakdown = [];

  const impactMap = {
    'LeetCode 150': { boost: 9, reasoning: 'Strengthens dynamic programming & graph traversal for SDE-1 coding rounds.' },
    'Docker CI/CD': { boost: 11, reasoning: 'Closes industry DevOps gap; demonstrates production deployment readiness.' },
    'DBMS Indexing': { boost: 7, reasoning: 'Improves database optimization knowledge required for system architecture questions.' },
    'System Design Mini': { boost: 12, reasoning: 'Distinguishes Sem 5 candidate for Tier-1 engineering placement opportunities.' }
  };

  addedSkills.forEach(skill => {
    if (impactMap[skill]) {
      totalBoost += impactMap[skill].boost;
      breakdown.push({
        skill,
        boost: impactMap[skill].boost,
        reasoning: impactMap[skill].reasoning
      });
    } else {
      totalBoost += 5;
      breakdown.push({
        skill,
        boost: 5,
        reasoning: 'General competency improvement.'
      });
    }
  });

  const base = parseInt(currentScore) || 68;
  const simulatedScore = Math.min(100, base + totalBoost);
  const benchmark = DB.roleBenchmarks[targetRole]?.minPlacementScore || 75;

  res.json({
    success: true,
    baseScore: base,
    simulatedScore,
    totalBoost,
    benchmarkScore: benchmark,
    isPlacementReady: simulatedScore >= benchmark,
    placementPercentile: Math.min(99, Math.round(50 + (simulatedScore - 50) * 0.95)),
    breakdown
  });
});

// POST /api/ai/analyze-resume
router.post('/analyze-resume', (req, res) => {
  const { resumeText, targetRole = 'Software Developer' } = req.body;

  if (!resumeText || resumeText.trim().length < 10) {
    return res.status(400).json({ success: false, message: 'Please provide valid resume text or project summary.' });
  }

  const textLower = resumeText.toLowerCase();

  // Find detected keywords
  const matchedKeywords = TECH_KEYWORDS.filter(kw => textLower.includes(kw.toLowerCase()));

  // Calculate score based on keyword coverage and depth
  const coreCompetencies = ['Data Structures', 'Algorithms', 'SQL', 'DBMS', 'OOP', 'Java', 'C++', 'React', 'Node.js', 'Git'];
  const matchedCore = coreCompetencies.filter(kw => textLower.includes(kw.toLowerCase()));

  const matchPercentage = Math.min(95, Math.max(35, Math.round((matchedKeywords.length / 14) * 100)));

  // Generate intelligent strengths and gaps
  const strengths = [];
  const gaps = [];
  const recommendedKeywords = [];

  if (textLower.includes('react') || textLower.includes('javascript') || textLower.includes('frontend')) {
    strengths.push('Demonstrated modern frontend development skills (React/Web).');
  } else {
    gaps.push('No explicit frontend framework mentioned (React/Vue recommended).');
    recommendedKeywords.push('React');
  }

  if (textLower.includes('sql') || textLower.includes('mongodb') || textLower.includes('database') || textLower.includes('dbms')) {
    strengths.push('Relational or document database foundation present.');
  } else {
    gaps.push('Database modeling, query optimization, or SQL experience is missing.');
    recommendedKeywords.push('SQL', 'PostgreSQL');
  }

  if (textLower.includes('docker') || textLower.includes('kubernetes') || textLower.includes('ci/cd') || textLower.includes('aws')) {
    strengths.push('Valuable DevOps and containerization exposure highlighted.');
  } else {
    gaps.push('Missing containerization or cloud deployment experience (Docker/AWS).');
    recommendedKeywords.push('Docker', 'CI/CD');
  }

  if (textLower.includes('test') || textLower.includes('jest') || textLower.includes('unit test')) {
    strengths.push('Software testing awareness documented.');
  } else {
    gaps.push('No testing methodology mentioned (Unit Testing / Jest / PyTest).');
    recommendedKeywords.push('Unit Testing');
  }

  if (textLower.includes('design') || textLower.includes('system design') || textLower.includes('microservice')) {
    strengths.push('System architecture and design pattern orientation.');
  } else {
    recommendedKeywords.push('System Design', 'Redis');
  }

  res.json({
    success: true,
    targetRole,
    matchPercentage,
    matchedKeywords,
    strengths: strengths.length ? strengths : ['General Computer Science academic background'],
    gaps: gaps.length ? gaps : ['Consider highlighting measurable project metrics and benchmarks.'],
    recommendedKeywords: [...new Set(recommendedKeywords)].slice(0, 6)
  });
});

export default router;
