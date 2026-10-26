const levelScores = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };

function scoreForLevel(level) {
  return levelScores[level] || 50;
}

function calculateReadiness(skills = []) {
  const totalRequired = skills.reduce((sum, skill) => sum + Number(skill.required ?? scoreForLevel(skill.requiredLevel ?? skill.required_level)), 0);
  const totalCurrent = skills.reduce((sum, skill) => {
    const current = Number(skill.current ?? skill.currentScore ?? skill.proficiency_score ?? 0);
    const required = Number(skill.required ?? scoreForLevel(skill.requiredLevel ?? skill.required_level));
    return sum + Math.min(current, required);
  }, 0);

  return totalRequired > 0 ? Math.round(totalCurrent / totalRequired * 100) : 0;
}

module.exports = { levelScores, scoreForLevel, calculateReadiness };
