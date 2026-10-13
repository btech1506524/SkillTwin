import { useEffect, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, ClipboardCheck, LoaderCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function AssessmentsPanel() {
  const [assessments, setAssessments] = useState([]);
  const [history, setHistory] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const authenticated = Boolean(localStorage.getItem('skilltwin_token'));

  const loadCatalog = async () => {
    setLoading(true);
    const [catalog, attempts] = await Promise.all([
      apiService.getAssessments(), apiService.getAssessmentResults()
    ]);
    if (catalog.success) setAssessments(catalog.assessments);
    else setError(catalog.message);
    if (attempts.success) setHistory(attempts.results);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadCatalog();
    else setLoading(false);
  }, [authenticated]);

  const startAssessment = async (item) => {
    setError('');
    setResult(null);
    setReview([]);
    setAnswers({});
    setLoading(true);
    const response = await apiService.getAssessment(item.id);
    if (response.success) setAssessment(response);
    else setError(response.message);
    setLoading(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!assessment || Object.keys(answers).length !== assessment.questions.length) {
      setError('Answer every question before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');
    const response = await apiService.submitAssessment(assessment.assessment.id, assessment.questions.map(question => ({
      questionId: question.id,
      selectedOptionKey: answers[question.id]
    })));
    if (response.success) {
      setResult(response.result);
      setReview(response.answers);
      const attempts = await apiService.getAssessmentResults();
      if (attempts.success) setHistory(attempts.results);
    } else setError(response.message);
    setSubmitting(false);
  };

  const backToCatalog = () => {
    setAssessment(null);
    setAnswers({});
    setResult(null);
    setReview([]);
    setError('');
    loadCatalog();
  };

  if (!authenticated) {
    return <div className="assessments-empty"><ClipboardCheck size={34} /><h3>Sign in to take assessments</h3><p>Your attempts and scores are saved to your account.</p></div>;
  }

  if (loading && !assessment) return <div className="assessments-loading"><LoaderCircle className="spin-icon" /> Loading assessments…</div>;

  return (
    <div className="tab-pane assessments-pane">
      {assessment ? (
        <>
          <div className="pane-header assessments-header">
            <div>
              <button className="assessment-back-btn" type="button" onClick={backToCatalog}><ArrowLeft size={15} /> All assessments</button>
              <h2>{result ? 'Assessment results' : assessment.assessment.title}</h2>
              <p>{result ? `${result.score} of ${result.totalPoints} points · ${result.percentage}%` : assessment.assessment.description}</p>
            </div>
            {result && <div className="assessment-score-badge"><Award size={20} /> {result.percentage}%</div>}
          </div>
          {error && <p className="assessment-error" role="alert">{error}</p>}
          {!result ? (
            <form onSubmit={submit}>
              <div className="assessment-question-list">
                {assessment.questions.map((question, index) => (
                  <fieldset className="assessment-question" key={question.id}>
                    <legend><span>{String(index + 1).padStart(2, '0')}</span>{question.questionText}</legend>
                    <div className="assessment-options">
                      {question.options.map(option => (
                        <label className={`assessment-option ${answers[question.id] === option.key ? 'selected' : ''}`} key={option.key}>
                          <input type="radio" name={`question-${question.id}`} value={option.key}
                            checked={answers[question.id] === option.key}
                            onChange={() => setAnswers(previous => ({ ...previous, [question.id]: option.key }))} />
                          <span>{option.text}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <button className="primary-btn assessment-submit-btn" type="submit" disabled={submitting}>
                {submitting ? <><LoaderCircle className="spin-icon" size={16} /> Scoring…</> : 'Submit assessment'}
              </button>
            </form>
          ) : (
            <div className="assessment-review-list">
              {review.map((answer, index) => (
                <article className="assessment-review-card" key={answer.questionId}>
                  <div className="assessment-review-title">
                    {answer.isCorrect ? <CheckCircle2 className="assessment-correct" size={18} /> : <XCircle className="assessment-incorrect" size={18} />}
                    <strong>{index + 1}. {answer.questionText}</strong>
                  </div>
                  <p>Your answer: {answer.options.find(option => option.key === answer.selectedOptionKey)?.text}</p>
                  {!answer.isCorrect && <p>Correct answer: {answer.options.find(option => option.key === answer.correctOptionKey)?.text}</p>}
                  <p className="assessment-explanation">{answer.explanation}</p>
                </article>
              ))}
              <button className="secondary-btn" type="button" onClick={backToCatalog}>Back to assessments</button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="pane-header">
            <div><h2>Skill assessments</h2><p>Check your understanding. The server grades and saves every attempt to your account.</p></div>
          </div>
          {error && <p className="assessment-error" role="alert">{error}</p>}
          <div className="assessment-catalog-grid">
            {assessments.map(item => (
              <article className="assessment-catalog-card" key={item.id}>
                <div className="assessment-card-icon"><ClipboardCheck size={21} /></div>
                <span className="assessment-category">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="assessment-card-footer"><span>{item.questionCount} questions</span><button className="primary-btn" type="button" onClick={() => startAssessment(item)}>Start</button></div>
              </article>
            ))}
            {!assessments.length && !error && <p>No assessments are available yet.</p>}
          </div>
          <section className="assessment-history">
            <h3>Recent attempts</h3>
            {history.length ? history.map(attempt => (
              <div className="assessment-history-row" key={attempt.id}>
                <div><strong>{attempt.title}</strong><span>{new Date(attempt.submittedAt).toLocaleString()}</span></div>
                <span className="assessment-history-score">{attempt.score}/{attempt.totalPoints}</span>
              </div>
            )) : <p>Your submitted assessment scores will appear here.</p>}
          </section>
        </>
      )}
    </div>
  );
}
