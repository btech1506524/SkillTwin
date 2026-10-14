import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, GraduationCap, LoaderCircle, Target, UserRound } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const emptyProfile = { name: '', email: '', phone: '', college: '', branch: '', semester: '', targetRole: '', cgpa: '', graduationYear: '' };
const categoryCopy = {
  common: { title: 'Basic / Common Skills', description: 'Core foundations used across computer science careers.' },
  core: { title: 'Core Role Skills', description: 'Skills directly connected to the career role you selected.' },
  soft: { title: 'Soft Skills', description: 'Useful professional skills that are optional for this role.' },
  specialized: { title: 'Additional / Specialized Skills', description: 'Relevant tools and deeper topics that can strengthen your profile.' }
};
const categoryOrder = ['common', 'core', 'soft', 'specialized'];
const scoreForLevel = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
const levelForScore = (score) => Object.entries(scoreForLevel).reduce((result, [level, value]) => Number(score) >= value ? level : result, 'Beginner');
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
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selected, setSelected] = useState({});
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const draftSave = useRef(Promise.resolve(null));
  const draftTimer = useRef(null);
  const skillRequest = useRef(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await apiService.getOnboarding();
      if (!active) return;
      if (!result?.success) {
        setError(result?.message || 'Unable to load your profile setup.');
        setLoading(false);
        return;
      }
      const savedProfile = { ...emptyProfile, ...result.profile };
      setProfile(savedProfile);
      setRoles(result.roles || []);
      const savedSelection = Object.fromEntries((result.savedSkills || [])
        .filter(skill => skill.proficiencyScore != null)
        .map(skill => [skill.skillId, { proficiencyScore: Number(skill.proficiencyScore), yearsExperience: Number(skill.yearsExperience || 0) }]));
      setSelected(savedSelection);
      const role = (result.roles || []).find(item => item.name === savedProfile.targetRole);
      if (role) {
        setLoadingSkills(true);
        const catalog = await apiService.getRoleOnboardingSkills(role.id);
        if (!active) return;
        if (catalog?.success) {
          const relevantIds = new Set((catalog.skills || []).map(skill => Number(skill.skillId)));
          setSkills(catalog.skills || []);
          setSelected(Object.fromEntries(Object.entries(savedSelection).filter(([id]) => relevantIds.has(Number(id)))));
        } else {
          setError(catalog?.message || 'Unable to load skills for this career role.');
        }
        setLoadingSkills(false);
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

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
    }, 900);
    return () => clearTimeout(draftTimer.current);
  }, [profile, selected, loading, saving]);

  const groupedSkills = useMemo(() => {
    const groups = Object.fromEntries(categoryOrder.map(category => [category, []]));
    skills.forEach(skill => (groups[categoryOrder.includes(skill.category) ? skill.category : 'core']).push(skill));
    return groups;
  }, [skills]);
  const selectedCountByCategory = useMemo(() => Object.fromEntries(categoryOrder.map(category => [category,
    groupedSkills[category].filter(skill => selected[skill.skillId]).length])), [groupedSkills, selected]);
  const selectedSkills = useMemo(() => skills.filter(skill => selected[skill.skillId]), [skills, selected]);
  const requiredSkills = skills.filter(skill => skill.isRequired);

  const loadRoleSkills = async (role) => {
    if (!role) {
      setSkills([]);
      setSelected({});
      setProfile(previous => ({ ...previous, targetRole: '' }));
      return;
    }
    const request = ++skillRequest.current;
    setLoadingSkills(true);
    setError('');
    setNotice('');
    const result = await apiService.getRoleOnboardingSkills(role.id);
    if (request !== skillRequest.current) return;
    if (!result?.success) {
      setError(result?.message || 'Unable to load skills for this career role.');
      setLoadingSkills(false);
      return;
    }
    const nextSkills = result.skills || [];
    const allowedIds = new Set(nextSkills.map(skill => Number(skill.skillId)));
    const retained = Object.fromEntries(Object.entries(selected).filter(([id]) => allowedIds.has(Number(id))));
    const removedCount = Object.keys(selected).length - Object.keys(retained).length;
    setSkills(nextSkills);
    setSelected(retained);
    setProfile(previous => ({ ...previous, targetRole: role.name }));
    if (removedCount) setNotice(`${removedCount} selected skill${removedCount === 1 ? '' : 's'} no longer apply to ${role.name} and were removed. Skills shared with this role were kept.`);
    setLoadingSkills(false);
  };

  const changeProfile = (event) => setProfile(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const toggleSkill = (skill) => setSelected(previous => {
    const updated = { ...previous };
    if (updated[skill.skillId]) delete updated[skill.skillId];
    else updated[skill.skillId] = {
      proficiencyScore: skill.proficiencyScore == null ? 25 : Number(skill.proficiencyScore),
      yearsExperience: skill.yearsExperience || 0
    };
    return updated;
  });
  const updateSkill = (skillId, field, value) => setSelected(previous => ({
    ...previous,
    [skillId]: { ...previous[skillId], [field]: value }
  }));

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
      setStep(3);
      return;
    }
    await finishOnboarding();
    navigate('/dashboard', { replace: true });
  };

  const selectedRole = roles.find(role => role.name === profile.targetRole);
  const canReview = Boolean(selectedRole && !loadingSkills && skills.length && profile.name.trim() && profile.college.trim() && profile.branch.trim() && profile.semester);

  return (
    <div className="onboarding-page">
      <Navbar />
      <main className="onboarding-main">
        <header className="onboarding-heading">
          <span className="onboarding-eyebrow"><GraduationCap size={16} /> Student profile setup</span>
          <h1>{editing ? 'Update your profile' : 'Build your personal SkillTwin'}</h1>
          <p>Choose a career goal first. We’ll use it to show relevant skills, identify learning gaps, and personalize your dashboard.</p>
        </header>

        <nav className="onboarding-stepper" aria-label="Profile setup steps">
          {[['1', 'Career goal'], ['2', 'Your skills'], ['3', 'Review and save']].map(([number, label], index) => {
            const stepNumber = index + 1;
            return <div className={`onboarding-step ${step === stepNumber ? 'active' : ''} ${step > stepNumber ? 'complete' : ''}`} key={number} aria-current={step === stepNumber ? 'step' : undefined}>
              <span>{step > stepNumber ? <Check size={15} /> : number}</span>{label}
            </div>;
          })}
        </nav>

        {error && <div className="onboarding-error" role="alert">{error}</div>}
        {notice && <div className="onboarding-notice" role="status">{notice}</div>}
        {loading ? <div className="onboarding-loading"><LoaderCircle className="spin-icon" /> Loading your saved setup…</div> : (
          <form className="onboarding-form" onSubmit={submit}>
            {step === 1 && <section className="onboarding-card">
              <div className="onboarding-card-title"><Target /><div><h2>Step 1 — Select your career goal</h2><p>Choose the role you want to prepare for. Your selection determines the skills shown next.</p></div></div>
              {roles.length ? <div className="onboarding-role-grid">
                {roles.map(role => <button type="button" key={role.id} className={`onboarding-role-card ${profile.targetRole === role.name ? 'selected' : ''}`}
                  onClick={() => loadRoleSkills(role)} aria-pressed={profile.targetRole === role.name}>
                  <span className="onboarding-role-icon"><Target size={19} /></span>
                  <span className="onboarding-role-copy"><strong>{role.name}</strong><span>{role.description || 'Explore skills and learning opportunities for this career.'}</span></span>
                  <span className="onboarding-role-radio" aria-hidden="true">{profile.targetRole === role.name && <Check size={14} />}</span>
                </button>)}
              </div> : <p className="onboarding-empty">Career roles could not be loaded. Please refresh and try again.</p>}
              <div className="onboarding-actions onboarding-actions-end">
                <button type="button" className="onboarding-next" disabled={!selectedRole || loadingSkills} onClick={() => setStep(2)}>
                  {loadingSkills ? <><LoaderCircle className="spin-icon" size={17} /> Loading role skills…</> : <>Continue to skills <ArrowRight size={17} /></>}
                </button>
              </div>
            </section>}

            {step === 2 && <section className="onboarding-card">
              <div className="onboarding-card-title"><BookOpen /><div><h2>Step 2 — Select skills you already have</h2><p><strong>{profile.targetRole}</strong> requirements are listed below. A required badge marks skills used for readiness; optional skills do not affect the score.</p></div></div>
              {loadingSkills ? <div className="onboarding-loading"><LoaderCircle className="spin-icon" /> Loading skills for {profile.targetRole}…</div> : !skills.length ? <div className="onboarding-empty">No skills are configured for this role yet. Choose another role or contact an administrator.</div> : <>
                <div className="onboarding-skill-summary" role="status"><strong>{Object.keys(selected).length}</strong> selected <span>·</span> <strong>{requiredSkills.length}</strong> required skills for this role</div>
                <div className="onboarding-skill-legend"><span className="required-badge">Required</span><span>Counts toward readiness and skill gaps</span><span className="optional-badge">Optional</span><span>Available to track, excluded from readiness</span></div>
                {categoryOrder.map(category => {
                  const categorySkills = groupedSkills[category];
                  if (!categorySkills.length) return null;
                  const copy = categoryCopy[category];
                  return <section className="onboarding-skill-group" key={category} aria-labelledby={`category-${category}`}>
                    <div className="onboarding-category-heading"><div><h3 id={`category-${category}`}>{copy.title}</h3><p>{copy.description}</p></div><span>{selectedCountByCategory[category]} / {categorySkills.length} selected</span></div>
                    <div className="onboarding-skill-grid">
                      {categorySkills.map(skill => {
                        const isSelected = Boolean(selected[skill.skillId]);
                        const level = isSelected ? levelForScore(selected[skill.skillId].proficiencyScore) : '';
                        return <article className={`onboarding-skill ${isSelected ? 'selected' : ''}`} key={skill.skillId}>
                          <button type="button" className="onboarding-skill-toggle" onClick={() => toggleSkill(skill)} aria-pressed={isSelected}>
                            <span className="onboarding-check">{isSelected && <Check size={15} />}</span>
                            <span className="onboarding-skill-name">{skill.skillName}<span className={skill.isRequired ? 'required-badge' : 'optional-badge'}>{skill.isRequired ? 'Required' : 'Optional'}</span></span>
                          </button>
                          {skill.description && <p className="onboarding-skill-description">{skill.description}</p>}
                          {isSelected && <div className="onboarding-rating">
                            <label htmlFor={`skill-${skill.skillId}`}>Your current proficiency</label>
                            <select id={`skill-${skill.skillId}`} value={level} onChange={event => updateSkill(skill.skillId, 'proficiencyScore', scoreForLevel[event.target.value])}>
                              {Object.keys(scoreForLevel).map(proficiency => <option key={proficiency} value={proficiency}>{proficiency}</option>)}
                            </select>
                            <span className="onboarding-level-target">Role target: {skill.requiredLevel}{skill.isRequired ? '' : ' (optional)'}</span>
                          </div>}
                        </article>;
                      })}
                    </div>
                  </section>;
                })}
              </>}
              <div className="onboarding-actions"><button type="button" className="onboarding-back" onClick={() => setStep(1)}><ArrowLeft size={17} /> Change role</button>
                <button type="button" className="onboarding-next" disabled={!skills.length || loadingSkills} onClick={() => setStep(3)}>Review setup <ArrowRight size={17} /></button></div>
            </section>}

            {step === 3 && <>
              <section className="onboarding-card">
                <div className="onboarding-card-title"><UserRound /><div><h2>Step 3 — Your profile</h2><p>Keep your academic details up to date. Changing these fields won’t replace unrelated account information.</p></div></div>
                <div className="onboarding-fields">
                  <label>Full name<input name="name" value={profile.name} onChange={changeProfile} autoComplete="name" required maxLength="160" /></label>
                  <label>Email<input value={profile.email || user?.email || ''} disabled type="email" /></label>
                  <label>College or university<input name="college" value={profile.college} onChange={changeProfile} required maxLength="200" /></label>
                  <label>Branch / program<input name="branch" value={profile.branch} onChange={changeProfile} required maxLength="160" placeholder="e.g. Computer Science" /></label>
                  <label>Semester<select name="semester" value={profile.semester} onChange={changeProfile} required>
                    <option value="">Choose semester</option>{Array.from({ length: 12 }, (_, i) => i + 1).map(semester => <option key={semester} value={semester}>Semester {semester}</option>)}
                  </select></label>
                  <label>Phone (optional)<input name="phone" value={profile.phone} onChange={changeProfile} type="tel" maxLength="40" /></label>
                  <label>CGPA (optional)<input name="cgpa" value={profile.cgpa} onChange={changeProfile} type="number" min="0" max="10" step="0.01" /></label>
                  <label>Graduation year (optional)<input name="graduationYear" value={profile.graduationYear} onChange={changeProfile} type="number" min="2000" max="2200" /></label>
                </div>
              </section>
              <section className="onboarding-card onboarding-review">
                <div className="onboarding-card-title"><CheckCircle2 /><div><h2>Review and save</h2><p>Only the skills selected above will be saved as skills you already have. Unselected required skills will appear as learning gaps.</p></div></div>
                <div className="onboarding-review-role"><strong>Target role</strong><span>{profile.targetRole}</span><button type="button" onClick={() => setStep(1)}>Change</button></div>
                <div className="onboarding-review-skills"><strong>{selectedSkills.length} selected skill{selectedSkills.length === 1 ? '' : 's'}</strong>
                  {!selectedSkills.length ? <p>No current skills selected. You can still continue; your dashboard will show role requirements and skill gaps.</p> : <ul>{selectedSkills.map(skill => <li key={skill.skillId}><span>{skill.skillName}<small>{skill.isRequired ? 'Required' : 'Optional'}</small></span><strong>{levelForScore(selected[skill.skillId].proficiencyScore)}</strong></li>)}</ul>}
                </div>
              </section>
              <div className="onboarding-actions"><button type="button" className="onboarding-back" onClick={() => setStep(2)}><ArrowLeft size={17} /> Edit skills</button>
                <button className="onboarding-next" type="submit" disabled={saving || !canReview}>
                  {saving ? <><LoaderCircle className="spin-icon" size={18} /> Saving your setup…</> : <>{editing ? 'Save changes and open dashboard' : 'Save profile and open dashboard'} <ArrowRight size={18} /></>}
                </button></div>
              <p className="onboarding-draft-status" role="status">{draftStatus}</p>
            </>}
          </form>
        )}
      </main>
    </div>
  );
}
