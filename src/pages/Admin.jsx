import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowLeft, ArrowRight, BookOpen, Boxes, BriefcaseBusiness, Database, GraduationCap, LayoutDashboard, LogOut, RefreshCw, Search, ShieldCheck, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import './Admin.css';

const statCards = [
  ['users', 'All accounts', Users], ['students', 'Students', GraduationCap],
  ['admins', 'Administrators', ShieldCheck], ['roles', 'Career roles', BriefcaseBusiness],
  ['skills', 'Skills catalog', Boxes], ['roadmaps', 'Roadmap snapshots', Activity],
  ['roadmapTasks', 'Roadmap tasks', BookOpen], ['assessments', 'Assessments', BookOpen],
  ['assessmentQuestions', 'Assessment questions', Boxes], ['assessmentAttempts', 'Assessment attempts', Activity]
];

const displayValue = value => value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [tables, setTables] = useState([]);
  const [activeTable, setActiveTable] = useState('');
  const [tableData, setTableData] = useState(null);
  const [tablePage, setTablePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadOverview = useCallback(async () => {
    const result = await apiService.getAdminOverview();
    if (result.success) setOverview(result);
    else setError(result.message);
  }, []);

  const loadUsers = useCallback(async (page = 1, search = searchInput, role = roleFilter) => {
    setLoading(true);
    const result = await apiService.getAdminUsers({ page, search, role });
    if (result.success) {
      setUsers(result.users);
      setPagination(result.pagination);
      setError('');
    } else setError(result.message);
    setLoading(false);
  }, [searchInput, roleFilter]);

  const loadTables = useCallback(async () => {
    const result = await apiService.getAdminTables();
    if (result.success) {
      setTables(result.tables);
      setError('');
    } else setError(result.message);
  }, []);

  const loadTableRows = useCallback(async (name, page = 1) => {
    setLoading(true);
    const result = await apiService.getAdminTableRows(name, page);
    if (result.success) {
      setActiveTable(name);
      setTablePage(result.pagination.page);
      setTableData(result);
      setError('');
    } else setError(result.message);
    setLoading(false);
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => {
    if (section === 'users') loadUsers(1);
    if (section === 'database') loadTables();
  }, [section]);

  const openUser = async userId => {
    setLoading(true);
    setSelectedUser(null);
    const result = await apiService.getAdminUser(userId);
    if (result.success) {
      setSelectedUser(result);
      setError('');
    } else setError(result.message);
    setLoading(false);
  };

  const changeRole = async (account, accountRole) => {
    setNotice('');
    const result = await apiService.setAdminUserRole(account.id, accountRole);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setNotice(`${account.name}'s role is now ${accountRole}. They need to sign in again for the new access level to appear.`);
    await loadUsers(pagination.page);
    if (selectedUser?.user?.id === account.id) await openUser(account.id);
    await loadOverview();
  };

  const selectSection = next => {
    setSection(next);
    setError('');
    setNotice('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="admin-brand-mark">ST</span>
          <span><strong>SkillTwin</strong><small>ADMIN CONSOLE</small></span>
        </a>
        <div className="admin-sidebar-label">WORKSPACE</div>
        <button className={section === 'overview' ? 'active' : ''} onClick={() => selectSection('overview')}><LayoutDashboard size={18} /> Overview</button>
        <button className={section === 'users' ? 'active' : ''} onClick={() => selectSection('users')}><Users size={18} /> Users</button>
        <button className={section === 'database' ? 'active' : ''} onClick={() => selectSection('database')}><Database size={18} /> Database</button>
        <div className="admin-sidebar-spacer" />
        <div className="admin-session"><span className="admin-session-dot" /><div><strong>{user?.name || 'Administrator'}</strong><small>Administrator</small></div></div>
        <button className="admin-logout" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><div className="admin-eyebrow">SKILLTWIN / ADMIN</div><h1>{section === 'overview' ? 'System overview' : section === 'users' ? 'User management' : 'Database explorer'}</h1></div>
          <div className="admin-topbar-actions"><span className="admin-secure-badge"><ShieldCheck size={15} /> Protected admin session</span><button className="admin-refresh" aria-label="Refresh view" onClick={() => section === 'overview' ? loadOverview() : section === 'users' ? loadUsers(pagination.page) : loadTables()}><RefreshCw size={17} /></button></div>
        </header>

        {error && <div className="admin-alert error" role="alert">{error}<button aria-label="Dismiss" onClick={() => setError('')}><X size={16} /></button></div>}
        {notice && <div className="admin-alert success" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice('')}><X size={16} /></button></div>}

        {section === 'overview' && (
          <div className="admin-content">
            <div className="admin-welcome-card"><div><span className="admin-eyebrow">CONTROL CENTER</span><h2>Welcome, {user?.name?.split(' ')[0] || 'Admin'}</h2><p>Manage SkillTwin accounts and review records in the configured application database.</p></div><div className="admin-welcome-icon"><ShieldCheck size={32} /></div></div>
            {overview && <>
              <div className="admin-db-strip"><Database size={17} /><span>Connected schema</span><strong>{overview.database?.databaseName}</strong><i>MySQL {overview.database?.serverVersion}</i></div>
              <div className="admin-stats-grid">{statCards.map(([key, label, Icon]) => <article className="admin-stat-card" key={key}><span className="admin-stat-icon"><Icon size={18} /></span><span className="admin-stat-label">{label}</span><strong>{Number(overview.stats[key] || 0).toLocaleString()}</strong></article>)}</div>
              <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Quick access</h2><p>Browse student accounts or inspect application tables.</p></div></div><div className="admin-shortcuts"><button onClick={() => selectSection('users')}><Users size={18} /> Manage users <ArrowRight size={16} /></button><button onClick={() => selectSection('database')}><Database size={18} /> Browse database <ArrowRight size={16} /></button></div></section>
            </>}
          </div>
        )}

        {section === 'users' && (
          <div className="admin-content">
            <section className="admin-panel">
              <div className="admin-panel-heading"><div><h2>All accounts</h2><p>Search students and administrators, inspect their profiles and change account roles.</p></div><span className="admin-count-pill">{pagination.total.toLocaleString()} records</span></div>
              <form className="admin-filters" onSubmit={event => { event.preventDefault(); loadUsers(1, searchInput, roleFilter); }}>
                <label className="admin-search"><Search size={17} /><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Name, email, college or role" /></label>
                <select aria-label="Filter account role" value={roleFilter} onChange={event => { const role = event.target.value; setRoleFilter(role); loadUsers(1, searchInput, role); }}><option value="">All accounts</option><option value="student">Students</option><option value="admin">Administrators</option></select>
                <button className="admin-primary-btn" type="submit">Search</button>
              </form>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Account</th><th>College</th><th>Target role</th><th>Readiness</th><th>Access</th><th>Created</th><th /></tr></thead><tbody>
                {users.map(account => <tr key={account.id}><td><strong>{account.name}</strong><small>{account.email}</small></td><td>{account.college || '—'}</td><td>{account.targetRole || '—'}</td><td><span className="admin-score">{account.readinessScore}%</span></td><td><select aria-label={`Set access for ${account.name}`} value={account.accountRole} disabled={account.id === user?.id} onChange={event => changeRole(account, event.target.value)}><option value="student">Student</option><option value="admin">Admin</option></select></td><td>{new Date(account.createdAt).toLocaleDateString()}</td><td><button className="admin-link-btn" onClick={() => openUser(account.id)}>Details</button></td></tr>)}
                {!users.length && <tr><td colSpan="7" className="admin-empty">{loading ? 'Loading accounts…' : 'No accounts match this search.'}</td></tr>}
              </tbody></table></div>
              <div className="admin-pagination"><span>Page {pagination.page} · {pagination.total.toLocaleString()} accounts</span><div><button aria-label="Previous page" disabled={pagination.page <= 1 || loading} onClick={() => loadUsers(pagination.page - 1)}><ArrowLeft size={16} /></button><button aria-label="Next page" disabled={pagination.page * pagination.limit >= pagination.total || loading} onClick={() => loadUsers(pagination.page + 1)}><ArrowRight size={16} /></button></div></div>
            </section>
            {selectedUser && <UserDetails data={selectedUser} onClose={() => setSelectedUser(null)} />}
          </div>
        )}

        {section === 'database' && (
          <div className="admin-content">
            <section className="admin-panel"><div className="admin-panel-heading"><div><h2>Application tables</h2><p>Read-only view of records in the configured SkillTwin database. Credential and secret fields are hidden.</p></div><span className="admin-count-pill">{tables.length} tables</span></div>
              <div className="admin-db-table-grid">{tables.map(table => <button className={`admin-db-table-card ${activeTable === table.name ? 'active' : ''}`} key={table.name} onClick={() => loadTableRows(table.name, 1)}><Database size={18} /><strong>{table.name}</strong><span>{table.rows.toLocaleString()} rows · {table.columns} columns</span></button>)}</div>
            </section>
            {tableData && <section className="admin-panel"><div className="admin-panel-heading"><div><h2>{tableData.table}</h2><p>{tableData.pagination.total.toLocaleString()} records · page {tablePage}</p></div><span className="admin-read-only"><ShieldCheck size={14} /> READ ONLY</span></div>
              <div className="admin-table-wrap admin-records-wrap"><table className="admin-table admin-records-table"><thead><tr>{tableData.columns.map(column => <th key={column.name}>{column.name}{column.primaryKey && <small> PK</small>}</th>)}</tr></thead><tbody>{tableData.rows.map((row, index) => <tr key={index}>{tableData.columns.map(column => <td key={column.name}>{displayValue(row[column.name])}</td>)}</tr>)}{!tableData.rows.length && <tr><td colSpan={tableData.columns.length} className="admin-empty">No records in this table.</td></tr>}</tbody></table></div>
              <div className="admin-pagination"><span>Page {tablePage} · {tableData.pagination.total.toLocaleString()} records</span><div><button aria-label="Previous page" disabled={tablePage <= 1 || loading} onClick={() => loadTableRows(activeTable, tablePage - 1)}><ArrowLeft size={16} /></button><button aria-label="Next page" disabled={tablePage * tableData.pagination.limit >= tableData.pagination.total || loading} onClick={() => loadTableRows(activeTable, tablePage + 1)}><ArrowRight size={16} /></button></div></div>
            </section>}
          </div>
        )}
        <footer className="admin-footer">SkillTwin Administration <span>•</span> Access is audited by authenticated server-side role checks.</footer>
      </section>
    </main>
  );
}

function UserDetails({ data, onClose }) {
  const user = data.user;
  const fields = [
    ['Email', user.email], ['Phone', user.phone], ['College', user.college], ['Branch', user.branch],
    ['Semester', user.semester], ['Target career', user.targetRole], ['CGPA', user.cgpa],
    ['Readiness', `${user.readinessScore}%`], ['Graduation year', user.graduationYear], ['Created', new Date(user.createdAt).toLocaleString()]
  ];
  return <section className="admin-panel admin-user-details"><div className="admin-panel-heading"><div><h2>{user.name}</h2><p>Account #{user.id} · {user.accountRole}</p></div><button className="admin-icon-btn" aria-label="Close user details" onClick={onClose}><X size={18} /></button></div>
    <div className="admin-profile-grid">{fields.map(([label, value]) => <div key={label}><small>{label}</small><strong>{displayValue(value)}</strong></div>)}</div>
    <div className="admin-detail-columns"><DetailList title={`Skills (${data.skills.length})`} items={data.skills.map(skill => `${skill.skillName}: ${skill.proficiencyScore}% · ${skill.proficiencyLevel}`)} /><DetailList title={`Roadmaps (${data.roadmaps.length})`} items={data.roadmaps.map(item => `${item.title} · ${Number(item.completedTasks || 0)}/${item.taskCount} tasks`)} /><DetailList title={`Assessments (${data.assessmentAttempts.length})`} items={data.assessmentAttempts.map(item => `${item.assessment} · ${item.percentage}% · ${new Date(item.completedAt).toLocaleDateString()}`)} /><DetailList title={`Milestones (${data.completedMilestones.length})`} items={data.completedMilestones.map(item => `${item.milestoneKey} · ${new Date(item.completedAt).toLocaleDateString()}`)} /></div>
  </section>;
}

function DetailList({ title, items }) {
  return <div className="admin-detail-list"><h3>{title}</h3>{items.length ? <ul>{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul> : <p>Nothing recorded yet.</p>}</div>;
}
