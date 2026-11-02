import { useEffect, useState } from 'react';
import { CheckCircle2, Route, Sparkles, Target } from 'lucide-react';
import { countUniqueRoleSkills, ROLE_ROADMAPS } from '../data/roleRoadmaps';

export default function RoleRoadmapExplorer({ targetRole, selectedRole: selectedRoleProp, onRoleChange }) {
  const [internalRole, setInternalRole] = useState(() =>
    ROLE_ROADMAPS.find(roadmap => roadmap.role === targetRole)?.role || ROLE_ROADMAPS[0].role
  );
  useEffect(() => {
    if (!selectedRoleProp) {
      setInternalRole(ROLE_ROADMAPS.find(roadmap => roadmap.role === targetRole)?.role || ROLE_ROADMAPS[0].role);
    }
  }, [selectedRoleProp, targetRole]);

  const selectedRole = selectedRoleProp || internalRole;
  const changeRole = role => {
    if (onRoleChange) onRoleChange(role);
    else setInternalRole(role);
  };
  const roadmap = ROLE_ROADMAPS.find(item => item.role === selectedRole) || ROLE_ROADMAPS[0];
  const skillCount = countUniqueRoleSkills(roadmap);

  return (
    <section className="role-roadmap-explorer" aria-labelledby="role-roadmap-title">
      <header className="role-roadmap-header">
        <div className="role-roadmap-heading">
          <span className="role-roadmap-icon"><Route size={19} aria-hidden="true" /></span>
          <div>
            <p className="role-roadmap-eyebrow">Skill-first learning path</p>
            <h2 id="role-roadmap-title">Build your {roadmap.role} skills</h2>
          </div>
        </div>
        <div className="role-roadmap-select-wrap">
          <label htmlFor="role-roadmap-select">Choose a role</label>
          <select id="role-roadmap-select" value={selectedRole} onChange={event => changeRole(event.target.value)}>
            {ROLE_ROADMAPS.map(item => <option key={item.role} value={item.role}>{item.role}</option>)}
          </select>
        </div>
      </header>

      <p className="role-roadmap-summary">{roadmap.summary}</p>

      <div className="role-roadmap-overview" role="group" aria-label="Path overview">
        <div className="role-roadmap-stat">
          <span className="role-roadmap-stat-icon"><Target size={16} aria-hidden="true" /></span>
          <span><strong>{skillCount}</strong><small>role skills</small></span>
        </div>
        <div className="role-roadmap-stat">
          <span className="role-roadmap-stat-icon"><Route size={16} aria-hidden="true" /></span>
          <span><strong>{roadmap.stages.length}</strong><small>mastery stages</small></span>
        </div>
        <div className="role-roadmap-stat role-roadmap-stat-note">
          <span className="role-roadmap-stat-icon"><Sparkles size={16} aria-hidden="true" /></span>
          <span><strong>Flexible</strong><small>no fixed schedule</small></span>
        </div>
      </div>

      <div className="role-roadmap-section-heading">
        <div>
          <p className="role-roadmap-eyebrow">Learn by doing</p>
          <h3>Advance when you can show the skill</h3>
        </div>
        <p>Use each checkpoint as evidence that you are ready for the next skill group.</p>
      </div>

      <ol key={roadmap.role} className="role-roadmap-timeline">
        {roadmap.stages.map((stage, index) => (
          <li key={`${roadmap.role}-${stage.title}`} className="role-roadmap-step" style={{ animationDelay: `${index * 60}ms` }}>
            <div className="role-roadmap-marker" aria-hidden="true">
              <span>{String(index + 1).padStart(2, '0')}</span>
            </div>
            <article className="role-roadmap-card">
              <div className="role-roadmap-stage-label">
                <span>Stage {index + 1}</span>
                <span>{stage.stage}</span>
              </div>
              <h4>{stage.title}</h4>
              <div className="role-roadmap-checkpoint">
                <CheckCircle2 size={16} aria-hidden="true" />
                <div>
                  <strong>Mastery checkpoint</strong>
                  <p>{stage.masteryCheck}</p>
                </div>
              </div>
              <div className="role-roadmap-skill-focus">
                <h5>Skills in focus</h5>
                <ul className="role-roadmap-skills" aria-label={`Skills in ${stage.title}`}>
                  {stage.skills.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <p className="role-roadmap-note">There is no set pace. Build confidence in one skill group before moving on.</p>
    </section>
  );
}
