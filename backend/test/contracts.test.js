const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mock, test } = require('node:test');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-with-at-least-32-characters';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { app } = require('../server');
const { calculateReadiness } = require('../lib/readiness');
const { isHiddenAdminColumn } = require('../lib/security');

const tokenFor = (userId) => jwt.sign({ user_id: userId }, process.env.JWT_SECRET);
const source = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const frontendSource = name => fs.readFileSync(path.join(__dirname, '..', '..', 'src', name), 'utf8');

test('live health endpoint does not require database access', async () => {
  const response = await request(app).get('/api/health/live');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'online' });
});

test('auth routes reject malformed public input before database access', async () => {
  const register = await request(app).post('/api/auth/register').send({});
  const login = await request(app).post('/api/auth/login').send({ email: '', password: '' });
  assert.equal(register.status, 400);
  assert.equal(login.status, 400);
  assert.equal(register.body.success, false);
  assert.equal(login.body.success, false);
});

test('login and registration limiters return 429 after their configured window budget', async () => {
  const registrationResponses = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    registrationResponses.push(await request(app).post('/api/auth/register').send({}));
  }
  const loginResponses = [];
  for (let attempt = 0; attempt < 11; attempt += 1) {
    loginResponses.push(await request(app).post('/api/auth/login').send({}));
  }
  assert.equal(registrationResponses.at(-1).status, 429);
  assert.equal(loginResponses.at(-1).status, 429);
  assert.equal(registrationResponses.at(-1).body.success, false);
  assert.equal(loginResponses.at(-1).body.success, false);
});

test('protected routes reject missing and malformed bearer tokens', async () => {
  const missing = await request(app).get('/api/student/profile');
  const malformed = await request(app).get('/api/student/profile').set('Authorization', 'Bearer one two');
  assert.equal(missing.status, 401);
  assert.equal(malformed.status, 401);
});

test('student account cannot enter an administrator route', async () => {
  const query = mock.method(db, 'query', async () => [[{ account_role: 'student' }]]);
  const response = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${tokenFor(7)}`);
  assert.equal(response.status, 403);
  query.mock.restore();
});

test('readiness caps each skill at its target before calculating the ratio', () => {
  assert.equal(calculateReadiness([
    { current: 100, required: 50 },
    { current: 0, required: 100 }
  ]), 33);
  assert.equal(calculateReadiness([{ current: 75, required: 75 }]), 100);
});

test('admin table browsing excludes OAuth challenge material', () => {
  for (const name of ['nonce', 'code_verifier', 'state_hash', 'code_hash', 'password_hash']) {
    assert.equal(isHiddenAdminColumn(name), true, name);
  }
  assert.equal(isHiddenAdminColumn('created_at'), false);
});

test('SQL boundaries preserve required-skill scoring and row ownership', () => {
  assert.match(source('routes/ai.js'), /WHERE crs\.role_id = \? AND crs\.is_required = TRUE/);
  assert.match(source('routes/student.js'), /WHERE u\.user_id = \? AND crs\.is_required = TRUE/);
  assert.match(source('routes/roadmap.js'), /m\.milestone_id = \? AND r\.user_id = \? AND r\.is_current = TRUE/);
  assert.match(source('routes/assessments.js'), /WHERE r\.result_id = \? AND r\.user_id = \?/);
});

test('assessment question reads do not select answer keys before submission', () => {
  const assessments = source('routes/assessments.js');
  assert.match(assessments, /SELECT question_id AS id, question_text AS questionText, options_json AS options, points/);
  assert.doesNotMatch(assessments.match(/router\.get\("\/:assessmentId"[\s\S]*?\n\}\);/)[0], /correct_option_key|explanation/);
});

test('CGPA fresh schema and forward migration both support 10.00', () => {
  assert.match(source('schema.sql'), /cgpa DECIMAL\(4,2\)/);
  assert.match(source('migrations/001_student_readiness.sql'), /cgpa DECIMAL\(4,2\)/);
  assert.match(source('migrations/010_cgpa_precision.sql'), /MODIFY COLUMN cgpa DECIMAL\(4,2\)/);
});

test('frontend career intent is forwarded and validated before skill loading', () => {
  const signup = frontendSource('pages/Signup.jsx');
  const onboarding = frontendSource('pages/Onboarding.jsx');
  assert.match(signup, /onboarding\?targetRole=/);
  assert.match(onboarding, /new URLSearchParams\(location\.search\)\.get\('targetRole'\)/);
  assert.match(onboarding, /result\.roles \|\| \[\]\)\.find\(item => item\.name === requestedRole\)/);
});
