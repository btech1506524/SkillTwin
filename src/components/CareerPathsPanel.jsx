import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

export default function CareerPathsPanel({ hasAccountSession }) {
  const [careerPaths, setCareerPaths] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busyRoleId, setBusyRoleId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!hasAccountSession) {
      setCareerPaths([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    let active = true;
    setLoading(true);
    setError('');
    apiService.getCareerPaths().then(response => {
      if (!active) return;
      if (response?.success) {
        setCareerPaths(response.careerPaths || []);
      } else {
        setError(response?.message || 'Unable to compare career paths.');
      }
    }).catch(() => {
      if (active) setError('Unable to compare career paths. Try again.');
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [hasAccountSession, reloadKey]);

  const toggleSaved = async (careerPath) => {
    setBusyRoleId(careerPath.id);
    setError('');
    setStatus('');
    const response = careerPath.isSaved
      ? await apiService.removeCareerPath(careerPath.id)
      : await apiService.saveCareerPath(careerPath.id);

    if (response?.success) {
      const isSaved = !careerPath.isSaved;
      setCareerPaths(current => current.map(path => path.id === careerPath.id ? { ...path, isSaved } : path));
      setStatus(`${careerPath.name} ${isSaved ? 'added to' : 'removed from'} your shortlist.`);
    } else {
      setError(response?.message || 'Unable to update your shortlist.');
    }
    setBusyRoleId(null);
  };

  const shortlistCount = careerPaths.filter(path => path.isSaved).length;
  const visiblePaths = careerPaths
    .filter(path => filter === 'all' || path.isSaved)
    .sort((left, right) => {
      const scoreDifference = (right.readinessScore ?? -1) - (left.readinessScore ?? -1);
      return scoreDifference || Number(right.isTargetRole) - Number(left.isTargetRole) || left.name.localeCompare(right.name);
    });

  return (
    <div className="tab-pane career-paths-pane">
      <div className="career-paths-heading">
        <div>
          <h2>Explore career paths</h2>
          <p>Compare your saved skill ratings with the requirements for each role.</p>
        </div>
        {hasAccountSession && (
          <div className="career-path-filter" role="group" aria-label="Filter career paths">
            <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
              All paths <span>{careerPaths.length}</span>
            </button>
            <button type="button" aria-pressed={filter === 'saved'} onClick={() => setFilter('saved')}>
              Shortlist <span>{shortlistCount}</span>
            </button>
          </div>
        )}
      </div>

      {!hasAccountSession && (
        <div className="career-paths-signin">
          <p>Sign in to compare paths against your saved skills and keep a private shortlist.</p>
          <Link to="/login">Sign in to explore career paths</Link>
        </div>
      )}

      {hasAccountSession && loading && <p className="career-paths-message" role="status">Loading career paths…</p>}
      {hasAccountSession && error && (
        <div className="career-paths-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey(value => value + 1)}>Try again</button>
        </div>
      )}
      {hasAccountSession && status && <p className="career-paths-status" role="status" aria-live="polite">{status}</p>}
      {hasAccountSession && !loading && !error && visiblePaths.length === 0 && (
        <p className="career-paths-message">
          {filter === 'saved' ? 'No saved paths yet. Save a role to compare it here later.' : 'No career paths are configured yet.'}
        </p>
      )}

      {hasAccountSession && !error && visiblePaths.length > 0 && (
        <div className="career-path-grid">
          {visiblePaths.map(careerPath => (
            <article
              className={`career-path-card ${careerPath.isTargetRole ? 'current-target' : ''}`}
              key={careerPath.id}
              aria-labelledby={`career-path-${careerPath.id}`}
            >
              <div className="career-path-card-heading">
                <div>
                  <h3 id={`career-path-${careerPath.id}`}>{careerPath.name}</h3>
                  {careerPath.isTargetRole && <span className="career-path-target-badge">Current target</span>}
                </div>
                <div className="career-path-score">
                  <strong>{careerPath.readinessScore == null ? '—' : `${careerPath.readinessScore}%`}</strong>
                  <span>skill fit</span>
                </div>
              </div>

              <p className="career-path-description">{careerPath.description || 'Compare the saved skills in your profile with this role.'}</p>

              {careerPath.readinessScore == null ? (
                <p className="career-path-message">Rate skills in your profile to calculate this estimate.</p>
              ) : (
                <div className="career-path-meter">
                  <div
                    className="career-path-meter-fill"
                    role="progressbar"
                    aria-label={`${careerPath.name} required-skill fit`}
                    aria-valuenow={careerPath.readinessScore}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ width: `${careerPath.readinessScore}%` }}
                  />
                </div>
              )}

              <p className="career-path-skill-count">
                {careerPath.metCount} of {careerPath.totalRequiredSkills} required skills meet their target
              </p>

              <div className="career-path-gaps">
                <strong>Next skill gaps</strong>
                {careerPath.topGaps.length ? (
                  <ul>
                    {careerPath.topGaps.map(gap => (
                      <li key={gap.skillName}>
                        <span>{gap.skillName}</span>
                        <span>{gap.current}% / {gap.required}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No required skill gaps remain.</p>
                )}
              </div>

              <button
                className="career-path-save"
                type="button"
                aria-pressed={careerPath.isSaved}
                disabled={busyRoleId !== null}
                onClick={() => toggleSaved(careerPath)}
              >
                {careerPath.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {busyRoleId === careerPath.id ? 'Saving…' : careerPath.isSaved ? 'Saved to shortlist' : 'Save to shortlist'}
              </button>
            </article>
          ))}
        </div>
      )}

      {hasAccountSession && <p className="career-paths-disclaimer">Skill fit is calculated from your current self-rated skills and required role levels. It is a planning estimate, not a hiring prediction.</p>}
    </div>
  );
}
