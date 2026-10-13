const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

function parseOptions(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.assessment_id AS id, a.title, a.description, a.category,
              COUNT(DISTINCT q.question_id) AS questionCount,
              MAX(r.completed_at) AS lastAttemptAt
       FROM assessments a
       JOIN assessment_questions q ON q.assessment_id = a.assessment_id
       LEFT JOIN assessment_results r ON r.assessment_id = a.assessment_id AND r.user_id = ?
       WHERE a.is_active = TRUE
       GROUP BY a.assessment_id
       ORDER BY a.title`,
      [req.user.user_id]
    );
    res.json({ success: true, assessments: rows.map(row => ({ ...row, questionCount: Number(row.questionCount) })) });
  } catch (error) {
    console.error("Assessment list error:", error);
    res.status(500).json({ success: false, message: "Unable to load assessments." });
  }
});

router.get("/results", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.result_id AS id, r.assessment_id AS assessmentId, a.title,
              r.score, r.total_marks AS totalPoints, r.question_count AS questionCount,
              r.completed_at AS submittedAt
       FROM assessment_results r
       JOIN assessments a ON a.assessment_id = r.assessment_id
       WHERE r.user_id = ?
       ORDER BY r.completed_at DESC, r.result_id DESC
       LIMIT 50`,
      [req.user.user_id]
    );
    res.json({ success: true, results: rows.map(row => ({ ...row, score: Number(row.score), totalPoints: Number(row.totalPoints), questionCount: Number(row.questionCount) })) });
  } catch (error) {
    console.error("Assessment results error:", error);
    res.status(500).json({ success: false, message: "Unable to load assessment history." });
  }
});

router.get("/results/:resultId", async (req, res) => {
  try {
    const [results] = await db.query(
      `SELECT r.result_id AS id, r.assessment_id AS assessmentId, a.title,
              r.score, r.total_marks AS totalPoints, r.question_count AS questionCount,
              r.completed_at AS submittedAt
       FROM assessment_results r JOIN assessments a ON a.assessment_id = r.assessment_id
       WHERE r.result_id = ? AND r.user_id = ?`,
      [req.params.resultId, req.user.user_id]
    );
    if (!results.length) return res.status(404).json({ success: false, message: "Assessment result not found." });
    const [answers] = await db.query(
      `SELECT q.question_text AS questionText, q.options_json AS options,
              q.explanation, ra.selected_option_key AS selectedOptionKey,
              ra.correct_option_key AS correctOptionKey, ra.is_correct AS isCorrect,
              ra.points_awarded AS pointsAwarded, q.points
       FROM assessment_result_answers ra
       JOIN assessment_questions q ON q.question_id = ra.question_id
       WHERE ra.result_id = ? ORDER BY q.position`,
      [req.params.resultId]
    );
    res.json({
      success: true,
      result: { ...results[0], score: Number(results[0].score), totalPoints: Number(results[0].totalPoints), questionCount: Number(results[0].questionCount) },
      answers: answers.map(answer => ({ ...answer, options: parseOptions(answer.options), isCorrect: Boolean(answer.isCorrect), points: Number(answer.points), pointsAwarded: Number(answer.pointsAwarded) }))
    });
  } catch (error) {
    console.error("Assessment result detail error:", error);
    res.status(500).json({ success: false, message: "Unable to load assessment result." });
  }
});

router.get("/:assessmentId", async (req, res) => {
  try {
    const [assessments] = await db.query(
      "SELECT assessment_id AS id, title, description, category FROM assessments WHERE assessment_id = ? AND is_active = TRUE",
      [req.params.assessmentId]
    );
    if (!assessments.length) return res.status(404).json({ success: false, message: "Assessment not found." });
    const [questions] = await db.query(
      `SELECT question_id AS id, question_text AS questionText, options_json AS options, points
       FROM assessment_questions WHERE assessment_id = ? ORDER BY position`,
      [req.params.assessmentId]
    );
    res.json({ success: true, assessment: assessments[0], questions: questions.map(question => ({ ...question, options: parseOptions(question.options), points: Number(question.points) })) });
  } catch (error) {
    console.error("Assessment detail error:", error);
    res.status(500).json({ success: false, message: "Unable to load assessment." });
  }
});

router.post("/:assessmentId/submit", async (req, res) => {
  const submittedAnswers = req.body?.answers;
  if (!Array.isArray(submittedAnswers) || submittedAnswers.length === 0 || submittedAnswers.length > 100) {
    return res.status(400).json({ success: false, message: "Submit one answer for each assessment question." });
  }
  const seen = new Set();
  for (const answer of submittedAnswers) {
    if (!answer || !Number.isInteger(Number(answer.questionId)) || typeof answer.selectedOptionKey !== "string" || !answer.selectedOptionKey.trim()) {
      return res.status(400).json({ success: false, message: "Each answer must include a questionId and selectedOptionKey." });
    }
    const id = Number(answer.questionId);
    if (seen.has(id)) return res.status(400).json({ success: false, message: "Duplicate question answers are not allowed." });
    seen.add(id);
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [assessments] = await connection.query(
      "SELECT assessment_id, title FROM assessments WHERE assessment_id = ? AND is_active = TRUE FOR UPDATE",
      [req.params.assessmentId]
    );
    if (!assessments.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Assessment not found." });
    }
    const [questions] = await connection.query(
      `SELECT question_id, question_text, options_json, correct_option_key, explanation, points, position
       FROM assessment_questions WHERE assessment_id = ? ORDER BY position FOR UPDATE`,
      [req.params.assessmentId]
    );
    if (!questions.length || submittedAnswers.length !== questions.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Submit one answer for each assessment question." });
    }

    const answerByQuestionId = new Map(submittedAnswers.map(answer => [Number(answer.questionId), answer.selectedOptionKey.trim()]));
    const questionIds = new Set(questions.map(question => question.question_id));
    if (answerByQuestionId.size !== questions.length || [...answerByQuestionId.keys()].some(id => !questionIds.has(id))) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "One or more submitted questions do not belong to this assessment." });
    }

    const graded = [];
    let score = 0;
    let totalPoints = 0;
    for (const question of questions) {
      const options = parseOptions(question.options_json);
      const selectedOptionKey = answerByQuestionId.get(question.question_id);
      if (!options.some(option => option.key === selectedOptionKey)) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "One or more selected options are invalid." });
      }
      const isCorrect = selectedOptionKey === question.correct_option_key;
      const pointsAwarded = isCorrect ? Number(question.points) : 0;
      score += pointsAwarded;
      totalPoints += Number(question.points);
      graded.push({ question, selectedOptionKey, isCorrect, pointsAwarded, options });
    }

    const [resultInsert] = await connection.query(
      `INSERT INTO assessment_results
         (user_id, assessment_id, score, total_marks, percentage, correct_answers, wrong_answers, question_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.user_id, req.params.assessmentId, score, totalPoints,
        totalPoints ? score / totalPoints * 100 : 0,
        graded.filter(answer => answer.isCorrect).length,
        graded.filter(answer => !answer.isCorrect).length,
        questions.length]
    );
    for (const item of graded) {
      await connection.query(
        `INSERT INTO assessment_result_answers
           (result_id, question_id, selected_option_key, correct_option_key, is_correct, points_awarded)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [resultInsert.insertId, item.question.question_id, item.selectedOptionKey, item.question.correct_option_key, item.isCorrect, item.pointsAwarded]
      );
    }
    await connection.commit();

    res.status(201).json({
      success: true,
      result: {
        id: resultInsert.insertId,
        assessmentId: Number(req.params.assessmentId),
        title: assessments[0].title,
        score,
        totalPoints,
        questionCount: questions.length,
        percentage: totalPoints ? Math.round(score / totalPoints * 100) : 0
      },
      answers: graded.map(({ question, selectedOptionKey, isCorrect, pointsAwarded, options }) => ({
        questionId: question.question_id,
        questionText: question.question_text,
        options,
        selectedOptionKey,
        correctOptionKey: question.correct_option_key,
        isCorrect,
        pointsAwarded,
        points: Number(question.points),
        explanation: question.explanation
      }))
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Assessment submission error:", error);
    res.status(500).json({ success: false, message: "Unable to submit assessment." });
  } finally {
    connection?.release();
  }
});

module.exports = router;
