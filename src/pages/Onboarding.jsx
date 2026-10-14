import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, GraduationCap, LoaderCircle, UserRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const emptyProfile = { name: '', email: '', phone: '', college: '', branch: '', semester: '', targetRole: '', cgpa: '', graduationYear: '' };
const onboardingPayload = (profile, selected) => ({
  ...profile,
  skills: Object.entries(selected).map(([skillId, data]) => ({
    skillId: Number(skillId),
    proficiencyScore: Number(data.proficiencyScore),
    yearsExperience: Number(data.yearsExperience || 0)
  }))
});

export default function Onboarding() {
  const { user, finishOnboarding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editing = new URLSearchParams(location.search).has('edit');
  const [profile, setProfile] = useState(emptyProfile);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const draftSave = useRef(Promise.resolve(null));
  const draftTimer = useRef(null);

  useEffect(() => {
    let active = true;
    apiService.getOnboarding().then(result => {
      if (!active) return;
      if (!result?.success) {
        setError(result?.message || 'Unable to load your profile setup.');
        setLoading(false);
        return;
      }
      setProfile({ ...emptyProfile, ...result.profile });
      setSkills(result.skills || []);
      setRoles(result.roles || []);
      setSelected(Object.fromEntries((result.skills || [])
        .filter(skill => skill.proficiencyScore != null)
        .map(skill => [skill.skillId, { proficiencyScore: skill.proficiencyScore, yearsExperience: skill.yearsExperience || 0 }])));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const groupedSkills = useMemo(() => skills.reduce((groups, skill) => {
    (groups[skill.category] ||= []).push(skill);
    return groups;
  }, {}), [skills]);

  useEffect(() => {
    if (loading || saving) return undefined;
    setDraftStatus('Saving progress…');
    draftTimer.current = setTimeout(() => {
      const payload = onboardingPayload(profile, selected);
      draftSave.current = draftSave.current.catch(() => null).then(() => apiService.saveOnboarding(payload, false));
      draftSave.current.then(result => {
        if (result?.success) setDraftStatus('Progress saved to your account');
        else {
          setDraftStatus('Could not save progress');
          if (result?.message) setError(result.message);
        }
      });
    }, 800);
    return () => clearTimeout(draftTimer.current);
  }, [profile, selected, loading, saving]);

  const changeProfile = (event) => setProfile(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const toggleSkill = (skill) => setSelected(previous => {
    const updated = { ...previous };
    if (updated[skill.skillId]) delete updated[skill.skillId];
    else updated[skill.skillId] = { proficiencyScore: skill.proficiencyScore ?? 25, yearsExperience: skill.yearsExperience || 0 };
    return updated;
  });

  const submit = async (event) => {
    event.preventDefault();
    clearTimeout(draftTimer.current);
    setError('');
    setSaving(true);
    await draftSave.current.catch(() => null);
    const result = await apiService.saveOnboarding(onboardingPayload(profile, selected));
    setSaving(false);
    if (!result?.success) {
      setError(result?.message || 'Unable to save your profile setup.');
      return;
    }
    await finishOnboarding();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="onboarding-page">
      <Navbar />
      <main className="onboarding-main">
        <header className="onboarding-heading">
          <span className="onboarding-eyebrow"><GraduationCap size={16} /> Student profile setup</span>
          <h1>{editing ? 'Update your profile' : 'Build your personal SkillTwin'}</h1>
          <p>Tell us about your studies, choose a career goal, and add only skills you have actually practiced. Skills are optional and can be updated later.</p>
        </header>

        {error && <div className="onboarding-error" role="alert">{error}</div>}
        {loading ? <div className="onboarding-loading"><LoaderCircle className="spin-icon" /> Loading your saved setup…</div> : (
          <form className="onboarding-form" onSubmit={submit}>
            <section className="onboarding-card">
              <div className="onboarding-card-title"><UserRound /><div><h2>Your profile</h2><p>These details belong to your SkillTwin account.</p></div></div>
              <div className="onboarding-fields">
                <label>Full name<input name="name" value={profile.name} onChange={changeProfile} autoComplete="name" required maxLength="160" /></label>
                <label>Email<input value={profile.email || user?.email || ''} disabled type="email" /></label>
                <label>College or university<input name="college" value={profile.college} onChange={changeProfile} required maxLength="200" /></label>
                <label>Branch / program<input name="branch" value={profile.branch} onChange={changeProfile} required maxLength="160" placeholder="e.g. Computer Science" /></label>
                <label>Semester<select name="semester" value={profile.semester} onChange={changeProfile} required>
                  <option value="">Choose semester</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(semester => <option key={semester} value={semester}>Semester {semester}</option>)}
                </select></label>
                <label>Target career role<select name="targetRole" value={profile.targetRole} onChange={changeProfile} required>
                  <option value="">Choose a career goal</option>{roles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                </select></label>
                <label>Phone (optional)<input name="phone" value={profile.phone} onChange={changeProfile} type="tel" maxLength="40" /></label>
                <label>CGPA (optional)<input name="cgpa" value={profile.cgpa} onChange={changeProfile} type="number" min="0" max="10" step="0.01" /></label>
                <label>Graduation year (optional)<input name="graduationYear" value={profile.graduationYear} onChange={changeProfile} type="number" min="2000" max="2200" /></label>
              </div>
            </section>

            <section className="onboarding-card">
              <div className="onboarding-card-title"><BookOpen /><div><h2>Skills you have practiced (optional)</h2><p>Select only skills you have practiced. You can complete setup with no skills and add them later.</p></div></div>
              <div className="onboarding-skill-summary" role="status">{Object.keys(selected).length} selected</div>
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div className="onboarding-skill-group" key={category}>
                  <h3>{category}</h3>
                  <div className="onboarding-skill-grid">
                    {categorySkills.map(skill => {
                      const isSelected = Boolean(selected[skill.skillId]);
                      const level = selected[skill.skillId]?.proficiencyScore ?? 0;
                      return <article className={`onboarding-skill ${isSelected ? 'selected' : ''}`} key={skill.skillId}>
                        <button type="button" className="onboarding-skill-toggle" onClick={() => toggleSkill(skill)} aria-pressed={isSelected}>
                          <span className="onboarding-check">{isSelected && <Check size={15} />}</span><span>{skill.skillName}</span>
                        </button>
                        {isSelected && <div className="onboarding-rating">
                          <label htmlFor={`skill-${skill.skillId}`}>Current level <strong>{level}%</strong></label>
                          <input id={`skill-${skill.skillId}`} type="range" min="0" max="100" step="5" value={level}
                            onChange={event => setSelected(previous => ({ ...previous, [skill.skillId]: { proficiencyScore: Number(event.target.value) } }))} />
                          <div><span>Beginner</span><span>Advanced</span></div>
                          <label className="onboarding-experience" htmlFor={`experience-${skill.skillId}`}>Years of experience (optional)</label>
                          <input id={`experience-${skill.skillId}`} type="number" min="0" max="80" step="0.5" value={selected[skill.skillId].yearsExperience || 0}
                            onChange={event => setSelected(previous => ({ ...previous, [skill.skillId]: { ...previous[skill.skillId], yearsExperience: Number(event.target.value) } }))} />
                        </div>}
                      </article>;
                    })}
                  </div>
                </div>
              ))}
              {!skills.length && <p className="onboarding-error">The skill catalog could not be loaded. Try again in a moment.</p>}
            </section>

            <button className="onboarding-submit" type="submit" disabled={saving || !skills.length}>
              {saving ? <><LoaderCircle className="spin-icon" size={18} /> Saving your setup…</> : <>{editing ? 'Save profile changes' : 'Save profile and open dashboard'} <ArrowRight size={18} /></>}
            </button>
            <p className="onboarding-draft-status" role="status">{draftStatus}</p>
          </form>
        )}
      </main>
    </div>
  );
}
