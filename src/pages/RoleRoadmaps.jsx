import { ArrowRight, BookOpenCheck } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import RoleRoadmapExplorer from '../components/RoleRoadmapExplorer';
import { ROLE_ROADMAPS } from '../data/roleRoadmaps';

const roleSlug = role => role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function RoleRoadmaps() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedRole = ROLE_ROADMAPS.find(item => roleSlug(item.role) === searchParams.get('role'))?.role
    || ROLE_ROADMAPS[0].role;

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
          <div className="public-roadmaps-hero-icon"><BookOpenCheck size={20} aria-hidden="true" /></div>
          <p className="public-roadmaps-eyebrow">SkillTwin learning library</p>
          <h1>Choose a role. Get a clear path.</h1>
          <p className="public-roadmaps-intro">Browse original, role-specific learning plans with practical outcomes and focus areas. Free to explore; no account required.</p>
          <Link className="public-roadmaps-cta" to="/roadmaps#roadmap-guide">
            View a learning plan <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <section className="public-roadmap-catalog" aria-labelledby="public-roadmap-catalog-title">
          <div className="public-roadmap-catalog-heading">
            <div>
              <p className="role-roadmap-eyebrow">{ROLE_ROADMAPS.length} career paths</p>
              <h2 id="public-roadmap-catalog-title">Explore the catalogue</h2>
            </div>
            <p>Choose any role to preview its 12-week sequence.</p>
          </div>
          <ul className="public-roadmap-grid">
            {ROLE_ROADMAPS.map(item => (
              <li key={item.role}>
                <Link
                  className={`public-roadmap-card ${selectedRole === item.role ? 'selected' : ''}`}
                  to={`/roadmaps?role=${roleSlug(item.role)}#roadmap-guide`}
                  aria-current={selectedRole === item.role ? 'page' : undefined}
                >
                  <span>{item.role}</span>
                  <p>{item.summary}</p>
                  <small>{item.duration}</small>
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div id="roadmap-guide" className="public-roadmap-detail">
          <RoleRoadmapExplorer selectedRole={selectedRole} onRoleChange={selectRole} />
        </div>

        <p className="public-roadmaps-signup">Want to track skill gaps and save your progress? <Link to="/signup">Create an account <ArrowRight size={14} /></Link></p>
      </main>
      <Footer />
    </div>
  );
}
