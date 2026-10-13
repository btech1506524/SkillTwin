(() => {
  const TOKEN_KEY = 'skilltwin_admin_token';
  const USER_KEY = 'skilltwin_admin_user';
  const app = document.querySelector('#app');
  const state = {
    section: 'overview', overview: null, users: [], tables: [],
    pagination: { page: 1, limit: 25, total: 0 }, usersSearch: '', usersRole: '', tablePage: 1,
    tableData: null, activeTable: '', user: null, loading: false
  };
  const statCards = [
    ['users', 'All accounts', '♙'], ['students', 'Students', '♧'], ['admins', 'Administrators', '⬡'],
    ['roles', 'Career roles', '◇'], ['skills', 'Skills catalog', '⌘'], ['userSkills', 'Skill profiles', '▤'],
    ['roadmaps', 'Roadmap snapshots', '↗'], ['roadmapTasks', 'Roadmap tasks', '☷'],
    ['assessments', 'Assessments', '▧'], ['assessmentQuestions', 'Assessment questions', '≡'],
    ['assessmentAttempts', 'Assessment attempts', '◷']
  ];

  const esc = value => String(value ?? '—').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const display = value => value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  const date = value => value ? new Date(value).toLocaleDateString() : '—';
  const token = () => sessionStorage.getItem(TOKEN_KEY);

  async function api(path, options = {}) {
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
    if (token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(`/api${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || `Request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function showLogin(message = '') {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    state.user = null;
    app.innerHTML = `<main class="login-wrap"><section class="login-card">
      <div class="brand-mark">ST</div><p class="eyebrow">SkillTwin · Secure workspace</p>
      <h1>Admin sign in</h1><p class="muted">Use your SkillTwin administrator account to manage users and inspect application records.</p>
      <form id="login-form"><label class="field">Email address<input name="email" type="email" autocomplete="username" required maxlength="254" /></label>
      <label class="field">Password<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="primary" type="submit">Sign in securely</button><p id="login-hint" class="hint" role="alert">${esc(message)}</p></form>
    </section></main>`;
    document.querySelector('#login-form')?.addEventListener('submit', login);
  }

  async function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const hint = document.querySelector('#login-hint');
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Checking access…';
    hint.textContent = '';
    try {
      const result = await api('/auth/login', {
        method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') })
      });
      if (!result.success || !result.token || result.user?.accountRole !== 'admin') {
        throw new Error(result.user?.accountRole === 'admin' ? 'Unable to sign in.' : 'This account does not have administrator access.');
      }
      sessionStorage.setItem(TOKEN_KEY, result.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(result.user));
      state.user = result.user;
      await loadOverview();
      renderShell();
    } catch (error) {
      showLogin(error.message);
    }
  }

  function renderShell() {
    if (!token() || !state.user) return showLogin();
    const pageTitle = state.section === 'overview' ? 'System overview' : state.section === 'users' ? 'User management' : 'Database explorer';
    app.innerHTML = `<div class="app-shell">
      <aside class="sidebar"><a class="brand" href="/admin"><span class="brand-mark">ST</span><span><strong>SkillTwin</strong><small>ADMIN WORKSPACE</small></span></a>
      <div class="nav-label">CONTROL CENTER</div><nav aria-label="Admin sections">
        <button class="nav-button ${state.section === 'overview' ? 'active' : ''}" data-section="overview"><span class="nav-icon">▦</span>Overview</button>
        <button class="nav-button ${state.section === 'users' ? 'active' : ''}" data-section="users"><span class="nav-icon">♙</span>Users</button>
        <button class="nav-button ${state.section === 'database' ? 'active' : ''}" data-section="database"><span class="nav-icon">▤</span>Database</button>
      </nav><div class="side-spacer"></div><div class="session-card"><span class="online-dot"></span><span><strong>${esc(state.user.name || state.user.email)}</strong><small>Administrator session</small></span></div>
      <button class="nav-button logout" data-action="logout"><span class="nav-icon">↪</span>Sign out</button></aside>
      <main class="main"><header class="topbar"><div><p class="eyebrow">SKILLTWIN / ADMIN</p><h1>${pageTitle}</h1></div><div class="top-actions"><span class="secure-badge">● Protected admin session</span><button class="icon-button" data-action="refresh" aria-label="Refresh">↻</button></div></header>
      <div id="alert" aria-live="polite"></div><div id="view" class="content"></div><footer class="footer">SkillTwin Administration <span>•</span> Every request is checked against the current server-side account role.</footer></main>
      </div>`;
    app.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => selectSection(button.dataset.section)));
    app.querySelector('[data-action="logout"]').addEventListener('click', () => showLogin());
    app.querySelector('[data-action="refresh"]').addEventListener('click', refreshSection);
    renderSection();
  }

  function setAlert(message = '', type = 'error') {
    const target = document.querySelector('#alert');
    if (!target) return;
    target.innerHTML = message ? `<div class="alert ${type === 'success' ? 'success' : ''}" role="${type === 'success' ? 'status' : 'alert'}"><span>${esc(message)}</span><button class="dismiss" aria-label="Dismiss">×</button></div>` : '';
    target.querySelector('.dismiss')?.addEventListener('click', () => { target.innerHTML = ''; });
  }

  async function protectedRequest(path, options) {
    try { return await api(path, options); }
    catch (error) {
      if (error.status === 401 || error.status === 403) showLogin(error.status === 403 ? 'Administrator access is required.' : 'Your session expired. Sign in again.');
      else setAlert(error.message);
      throw error;
    }
  }

  async function loadOverview() {
    const result = await protectedRequest('/admin/overview');
    state.overview = result;
    return result;
  }

  async function selectSection(section) {
    state.section = section;
    setAlert();
    renderShell();
  }

  async function refreshSection() {
    setAlert();
    if (state.section === 'overview') await renderOverview();
    else if (state.section === 'users') await loadUsers(state.pagination.page);
    else await loadTables();
  }

  async function renderSection() {
    if (state.section === 'overview') return renderOverview();
    if (state.section === 'users') return loadUsers(1);
    return loadTables();
  }

  async function renderOverview() {
    const view = document.querySelector('#view');
    if (!view) return;
    view.innerHTML = '<section class="panel"><p class="muted">Loading system overview…</p></section>';
    try {
      if (!state.overview) await loadOverview();
      const { database = {}, stats = {} } = state.overview;
      view.innerHTML = `<section class="welcome"><div><p class="eyebrow">ADMINISTRATOR CONTROL CENTER</p><h2>Welcome, ${esc(state.user.name?.split(' ')[0] || 'Admin')}</h2><p>Manage SkillTwin accounts and inspect records in the configured application database.</p></div><span class="welcome-icon">⬡</span></section>
        <div class="db-strip"><span>▤</span><span>Connected schema</span><strong>${esc(database.databaseName)}</strong><span class="version">MySQL ${esc(database.serverVersion)}</span></div>
        <div class="stats-grid">${statCards.map(([key,label,icon]) => `<article class="stat-card"><span class="stat-label"><span class="stat-icon">${icon}</span>${label}</span><strong>${Number(stats[key] || 0).toLocaleString()}</strong></article>`).join('')}</div>
        <section class="panel"><div class="panel-head"><div><h2>Quick access</h2><p>Search student accounts or browse application tables.</p></div></div><div class="shortcuts"><button class="shortcut" data-jump="users"><span>♙</span>Manage users<span>→</span></button><button class="shortcut" data-jump="database"><span>▤</span>Browse database<span>→</span></button></div></section>`;
      view.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => selectSection(button.dataset.jump)));
    } catch {}
  }

  async function loadUsers(page = 1, search = state.usersSearch, role = state.usersRole) {
    const view = document.querySelector('#view');
    if (!view) return;
    view.innerHTML = '<section class="panel"><p class="muted">Loading accounts…</p></section>';
    try {
      const query = new URLSearchParams({ page: String(page), limit: '25', ...(search ? { search } : {}), ...(role ? { role } : {}) });
      const result = await protectedRequest(`/admin/users?${query}`);
      state.users = result.users || [];
      state.pagination = result.pagination;
      state.usersSearch = search;
      state.usersRole = role;
      drawUsers(search, role);
    } catch {}
  }

  function drawUsers(search = '', role = '') {
    const view = document.querySelector('#view');
    if (!view) return;
    const pagination = state.pagination;
    const rows = state.users.map(account => `<tr><td><strong>${esc(account.name)}</strong><small>${esc(account.email)}</small></td><td>${esc(account.college)}</td><td>${esc(account.targetRole)}</td><td><span class="score">${esc(account.readinessScore)}%</span></td><td><select class="role-select" data-role-id="${Number(account.id)}" aria-label="Set access for ${esc(account.name)}" ${Number(account.id) === Number(state.user.id) ? 'disabled' : ''}><option value="student" ${account.accountRole === 'student' ? 'selected' : ''}>Student</option><option value="admin" ${account.accountRole === 'admin' ? 'selected' : ''}>Admin</option></select></td><td>${date(account.createdAt)}</td><td><button class="link-button" data-user-id="${Number(account.id)}">Details</button></td></tr>`).join('');
    view.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>All accounts</h2><p>Search profiles, inspect student progress, and manage account access.</p></div><span class="pill">${Number(pagination.total).toLocaleString()} accounts</span></div>
      <form id="user-filters" class="filters"><input class="filter-input" name="search" value="${esc(search === '' ? document.querySelector('#user-filters [name=search]')?.value || '' : search)}" placeholder="Name, email, college or role" aria-label="Search accounts" /><select class="filter-select" name="role" aria-label="Filter account role"><option value="" ${!role ? 'selected' : ''}>All accounts</option><option value="student" ${role === 'student' ? 'selected' : ''}>Students</option><option value="admin" ${role === 'admin' ? 'selected' : ''}>Administrators</option></select><button class="primary" type="submit">Search</button></form>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Account</th><th>College</th><th>Target role</th><th>Readiness</th><th>Access</th><th>Created</th><th></th></tr></thead><tbody>${rows || '<tr><td class="empty" colspan="7">No accounts match this search.</td></tr>'}</tbody></table></div>
      <div class="pagination"><span>Page ${pagination.page} · ${Number(pagination.total).toLocaleString()} accounts</span><div class="page-actions"><button class="page-button" data-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''} aria-label="Previous page">←</button><button class="page-button" data-page="${pagination.page + 1}" ${pagination.page * pagination.limit >= pagination.total ? 'disabled' : ''} aria-label="Next page">→</button></div></div></section>`;
    view.querySelector('#user-filters').addEventListener('submit', event => {
      event.preventDefault(); const data = new FormData(event.currentTarget);
      loadUsers(1, String(data.get('search') || '').trim(), String(data.get('role') || ''));
    });
    view.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => {
      const form = new FormData(view.querySelector('#user-filters'));
      loadUsers(Number(button.dataset.page), String(form.get('search') || '').trim(), String(form.get('role') || ''));
    }));
    view.querySelectorAll('[data-user-id]').forEach(button => button.addEventListener('click', () => openUser(button.dataset.userId)));
    view.querySelectorAll('[data-role-id]').forEach(select => select.addEventListener('change', () => changeRole(select)));
  }

  async function changeRole(select) {
    const account = state.users.find(item => Number(item.id) === Number(select.dataset.roleId));
    if (!account) return;
    select.disabled = true;
    try {
      await protectedRequest(`/admin/users/${encodeURIComponent(account.id)}/role`, {
        method: 'PATCH', body: JSON.stringify({ accountRole: select.value })
      });
      setAlert(`${account.name}'s role is now ${select.value}. They must sign in again to refresh their access.`, 'success');
      state.overview = null;
      const form = new FormData(document.querySelector('#user-filters'));
      await loadUsers(state.pagination.page, String(form.get('search') || '').trim(), String(form.get('role') || ''));
    } catch { select.value = account.accountRole; select.disabled = false; }
  }

  async function openUser(userId) {
    try {
      const data = await protectedRequest(`/admin/users/${encodeURIComponent(userId)}`);
      const fields = [
        ['Email', data.user.email], ['Phone', data.user.phone], ['College', data.user.college], ['Branch', data.user.branch],
        ['Semester', data.user.semester], ['Target career', data.user.targetRole], ['CGPA', data.user.cgpa],
        ['Readiness', `${data.user.readinessScore}%`], ['Graduation year', data.user.graduationYear], ['Created', new Date(data.user.createdAt).toLocaleString()]
      ];
      const detail = (title, items, text) => `<section class="detail-box"><h3>${title} (${items.length})</h3>${items.length ? `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : `<p>${text}</p>`}</section>`;
      const roadmaps = (data.roadmaps || []).map(item => `${item.title} · ${Number(item.completedTasks || 0)}/${item.taskCount} tasks`);
      const assessments = (data.assessmentAttempts || []).map(item => `${item.assessment} · ${item.percentage}% · ${date(item.completedAt)}`);
      const skills = (data.skills || []).map(item => `${item.skillName}: ${item.proficiencyScore}% · ${item.proficiencyLevel}`);
      const milestones = (data.completedMilestones || []).map(item => `${item.milestoneKey} · ${date(item.completedAt)}`);
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `<section class="modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div class="panel-head"><div><h2 id="profile-title">${esc(data.user.name)}</h2><p>Account #${esc(data.user.id)} · ${esc(data.user.accountRole)}</p></div><button class="icon-button" data-close aria-label="Close details">×</button></div><div class="profile-grid">${fields.map(([label,value]) => `<div class="profile-item"><small>${label}</small><strong>${esc(display(value))}</strong></div>`).join('')}</div><div class="detail-columns">${detail('Skills', skills, 'No skill profile recorded.')}${detail('Roadmaps', roadmaps, 'No roadmap recorded.')}${detail('Assessments', assessments, 'No assessment attempts recorded.')}${detail('Milestones', milestones, 'No completed milestones recorded.')}</div></section>`;
      document.body.append(modal);
      modal.querySelector('[data-close]').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', event => { if (event.target === modal) modal.remove(); });
      document.addEventListener('keydown', function closeOnEscape(event) { if (event.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', closeOnEscape); } });
    } catch {}
  }

  async function loadTables() {
    const view = document.querySelector('#view');
    if (!view) return;
    view.innerHTML = '<section class="panel"><p class="muted">Loading application tables…</p></section>';
    try {
      const result = await protectedRequest('/admin/database/tables');
      state.tables = result.tables || [];
      const cards = state.tables.map(table => `<button class="table-card ${state.activeTable === table.name ? 'active' : ''}" data-table="${esc(table.name)}"><strong>▤ &nbsp;${esc(table.name)}</strong><small>${Number(table.rows).toLocaleString()} rows · ${esc(table.columns)} columns</small></button>`).join('');
      view.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>Application tables</h2><p>Read-only records in the configured SkillTwin database. Credential and secret fields are hidden.</p></div><span class="pill">${state.tables.length} tables</span></div><div class="table-grid">${cards || '<p class="muted">No application tables found.</p>'}</div></section><div id="table-records"></div>`;
      view.querySelectorAll('[data-table]').forEach(button => button.addEventListener('click', () => loadTableRows(button.dataset.table, 1)));
      if (state.tableData) drawTableRows();
    } catch {}
  }

  async function loadTableRows(name, page = 1) {
    try {
      const result = await protectedRequest(`/admin/database/tables/${encodeURIComponent(name)}?page=${page}&limit=25`);
      state.activeTable = name;
      state.tablePage = result.pagination.page;
      state.tableData = result;
      drawTableRows();
      document.querySelectorAll('[data-table]').forEach(button => button.classList.toggle('active', button.dataset.table === name));
    } catch {}
  }

  function drawTableRows() {
    const target = document.querySelector('#table-records');
    if (!target || !state.tableData) return;
    const { columns = [], rows = [], pagination, table } = state.tableData;
    target.innerHTML = `<section class="panel"><div class="panel-head"><div><h2>${esc(table)}</h2><p>${Number(pagination.total).toLocaleString()} records · page ${pagination.page}</p></div><span class="readonly-badge">◇ READ ONLY</span></div><div class="table-wrap"><table class="data-table"><thead><tr>${columns.map(column => `<th>${esc(column.name)}${column.primaryKey ? ' <small>PK</small>' : ''}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(row => `<tr>${columns.map(column => `<td>${esc(display(row[column.name]))}</td>`).join('')}</tr>`).join('') : `<tr><td class="empty" colspan="${Math.max(columns.length,1)}">No records in this table.</td></tr>`}</tbody></table></div><div class="pagination"><span>Page ${pagination.page} · ${Number(pagination.total).toLocaleString()} records</span><div class="page-actions"><button class="page-button" data-record-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''} aria-label="Previous page">←</button><button class="page-button" data-record-page="${pagination.page + 1}" ${pagination.page * pagination.limit >= pagination.total ? 'disabled' : ''} aria-label="Next page">→</button></div></div></section>`;
    target.querySelectorAll('[data-record-page]').forEach(button => button.addEventListener('click', () => loadTableRows(table, Number(button.dataset.recordPage))));
  }

  async function start() {
    const savedUser = sessionStorage.getItem(USER_KEY);
    try { state.user = savedUser ? JSON.parse(savedUser) : null; } catch { state.user = null; }
    if (!token() || !state.user) return showLogin();
    try {
      await loadOverview();
      renderShell();
    } catch (error) {
      if (error.status !== 401 && error.status !== 403) showLogin(error.message);
    }
  }

  start();
})();
