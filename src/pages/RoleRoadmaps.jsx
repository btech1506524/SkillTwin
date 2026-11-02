import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpenCheck, CheckCircle2, Layers, Search, Sparkles, Target, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import RoleRoadmapExplorer from '../components/RoleRoadmapExplorer';
import { countUniqueRoleSkills, ROLE_ROADMAPS } from '../data/roleRoadmaps';

const roleSlug = role => role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const PATH_STAGES = [
  { number: '01', title: 'Build foundations', icon: BookOpenCheck },
  { number: '02', title: 'Learn role skills', icon: Layers },
  { number: '03', title: 'Apply what you know', icon: Target },
  { number: '04', title: 'Show your work', icon: CheckCircle2 }
];

export default function RoleRoadmaps() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const selectedRole = ROLE_ROADMAPS.find(item => roleSlug(item.role) === searchParams.get('role'))?.role
    || ROLE_ROADMAPS[0].role;
  const filteredRoadmaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ROLE_ROADMAPS;
    return ROLE_ROADMAPS.filter(item =>
      item.role.toLowerCase().includes(query)
      || item.summary.toLowerCase().includes(query)
      || item.stages.some(stage => stage.skills.some(skill => skill.toLowerCase().includes(query)))
    );
  }, [search]);

  const selectRole = role => navigate({
    pathname: location.pathname,
    search: `?role=${encodeURIComponent(roleSlug(role))}`,
    hash: location.hash
  }, { replace: true });

  return (
    <div className="public-roadmaps-page">
      <Navbar />
      <main className="public-roadmaps-main">
        <header className="public-roadmaps-hero">
          <div className="public-roadmaps-hero-copy">
            <div className="public-roadmaps-hero-icon"><BookOpenCheck size={19} aria-hidden="true" /></div>
            <p className="public-roadmaps-eyebrow">SkillTwin skill library</p>
            <h1>Build the skills.<br /><span>Then prove them.</span></h1>
            <p className="public-roadmaps-intro">Choose a role and follow a practical skill path. Each stage names what to learn, how to apply it, and what you should be able to show. Move at your own pace.</p>
            <Link className="public-roadmaps-cta" to="/roadmaps#role-catalog">
              Explore the role library <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <div className="public-roadmaps-stats" role="group" aria-label="Roadmap library overview">
              <div><strong>{ROLE_ROADMAPS.length}</strong><span>career paths</span></div>
              <div><strong>{ROLE_ROADMAPS[0].stages.length}</strong><span>mastery stages</span></div>
              <div><strong>0</strong><span>fixed deadlines</span></div>
            </div>
          </div>

          <aside className="public-roadmaps-preview" aria-label="A skill path progresses from foundations to evidence of mastery">
            <div className="public-roadmaps-preview-head">
              <span><Sparkles size={15} aria-hidden="true" /> A flexible path</span>
              <small>Learn at your pace</small>
            </div>
            <ol>
              {PATH_STAGES.map((stage, index) => {
                const StageIcon = stage.icon;
                return (
                  <li key={stage.number} style={{ animationDelay: `${index * 55}ms` }}>
                    <span className="public-roadmaps-preview-node"><StageIcon size={16} aria-hidden="true" /></span>
                    <span className="public-roadmaps-preview-number">{stage.number}</span>
                    <strong>{stage.title}</strong>
                  </li>
                );
              })}
            </ol>
            <p>Advance when you can demonstrate the skill, not when a calendar says so.</p>
          </aside>
        </header>

        <section id="role-catalog" className="public-roadmap-catalog" aria-labelledby="public-roadmap-catalog-title">
          <div className="public-roadmap-catalog-heading">
            <div>
              <p className="public-roadmaps-eyebrow">Choose your direction</p>
              <h2 id="public-roadmap-catalog-title">Explore skill paths</h2>
              <p>Each guide is organized around role skills and practical proof of learning.</p>
            </div>
            <label className="public-roadmap-search">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Search roles or skills</span>
              <input
                type="search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search roles or skills"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </label>
          </div>

          <p className="public-roadmap-result-count" aria-live="polite">
            {filteredRoadmaps.length === ROLE_ROADMAPS.length
              ? `${ROLE_ROADMAPS.length} role paths`
              : `${filteredRoadmaps.length} of ${ROLE_ROADMAPS.length} role paths`}
          </p>
          <ul className="public-roadmap-grid">
            {filteredRoadmaps.map((item, index) => (
              <li key={item.role}>
                <Link
                  className={`public-roadmap-card ${selectedRole === item.role ? 'selected' : ''}`}
                  to={`/roadmaps?role=${roleSlug(item.role)}#roadmap-guide`}
                  aria-current={selectedRole === item.role ? 'page' : undefined}
                  style={{ animationDelay: `${index * 32}ms` }}
                >
                  <span className="public-roadmap-card-mark" aria-hidden="true">{item.role.slice(0, 2).toUpperCase()}</span>
                  <div className="public-roadmap-card-title">
                    <h3>{item.role}</h3>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </div>
                  <p>{item.summary}</p>
                  <span className="public-roadmap-card-meta">
                    <span>{countUniqueRoleSkills(item)} skills</span>
                    <span>{item.stages.length} stages</span>
                  </span>
                </Link>
              </li>
            ))}
            {!filteredRoadmaps.length && (
              <li className="public-roadmap-empty" role="status">
                <Search size={20} aria-hidden="true" />
                <strong>No matching role or skill</strong>
                <span>Try a broader term, such as data, design, or security.</span>
                <button type="button" onClick={() => setSearch('')}>Show all roles</button>
              </li>
            )}
          </ul>
        </section>

        <div id="roadmap-guide" className="public-roadmap-detail">
          <RoleRoadmapExplorer selectedRole={selectedRole} onRoleChange={selectRole} />
        </div>

        <aside className="public-roadmaps-signup">
          <div>
            <p className="public-roadmaps-eyebrow">Make it personal</p>
            <h2>Turn skill goals into your own plan.</h2>
            <p>Create an account to compare your skills with role requirements and track your personal roadmap.</p>
          </div>
          <Link to="/signup">Create a free account <ArrowRight size={15} aria-hidden="true" /></Link>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
