import { useState } from 'react';
import { ArrowRight, Route } from 'lucide-react';
import { ROLE_ROADMAPS } from '../data/roleRoadmaps';

export default function RoleRoadmapExplorer({ targetRole }) {
  const [selectedRole, setSelectedRole] = useState(() =>
    ROLE_ROADMAPS.find(roadmap => roadmap.role === targetRole)?.role || ROLE_ROADMAPS[0].role
  );
  const roadmap = ROLE_ROADMAPS.find(item => item.role === selectedRole) || ROLE_ROADMAPS[0];

  return (
    <section className="role-roadmap-explorer" aria-labelledby="role-roadmap-title">
      <div className="role-roadmap-header">
        <div className="role-roadmap-heading">
          <span className="role-roadmap-icon"><Route size={19} aria-hidden="true" /></span>
          <div>
            <p className="role-roadmap-eyebrow">Explore a career path</p>
            <h2 id="role-roadmap-title">Role roadmaps</h2>
          </div>
        </div>
        <div className="role-roadmap-select-wrap">
          <label htmlFor="role-roadmap-select">Choose a role</label>
          <select id="role-roadmap-select" value={selectedRole} onChange={event => setSelectedRole(event.target.value)}>
            {ROLE_ROADMAPS.map(item => <option key={item.role} value={item.role}>{item.role}</option>)}
          </select>
        </div>
      </div>

      <div className="role-roadmap-summary">
        <div>
          <span className="role-roadmap-duration">{roadmap.duration}</span>
          <p>{roadmap.summary}</p>
        </div>
        <span className="role-roadmap-local"><ArrowRight size={14} aria-hidden="true" /> Built for SkillTwin</span>
      </div>

      <ol className="role-roadmap-timeline">
        {roadmap.phases.map((phase, index) => (
          <li key={`${roadmap.role}-${phase.title}`} className="role-roadmap-step">
            <div className="role-roadmap-marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
            <article className="role-roadmap-card">
              <span className="role-roadmap-period">{phase.period}</span>
              <h3>{phase.title}</h3>
              <p>{phase.outcome}</p>
              <ul className="role-roadmap-skills" aria-label={`Topics for ${phase.title}`}>
                {phase.skills.map(skill => <li key={skill}>{skill}</li>)}
              </ul>
            </article>
          </li>
        ))}
      </ol>

      <p className="role-roadmap-note">This preview is independent of your target role and saved milestone progress.</p>
    </section>
  );
}
