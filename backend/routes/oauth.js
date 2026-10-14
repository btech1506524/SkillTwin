const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const OAUTH_TTL_SECONDS = 600;
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const MICROSOFT_TENANT_PATTERN = /^(common|organizations|consumers|[0-9a-f-]{36})$/i;
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const MICROSOFT_JWKS_URL = new URL("https://login.microsoftonline.com/common/discovery/v2.0/keys");
let josePromise;
let googleJwks;
let microsoftJwks;

class OAuthError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function digest(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function randomValue(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function configuredOrigins() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",").map(value => value.trim()).filter(Boolean);
}

function frontendUrl() {
  const value = process.env.OAUTH_FRONTEND_URL || configuredOrigins()[0];
  if (!configuredOrigins().includes(value)) throw new OAuthError("oauth_not_configured", 503);
  return value.replace(/\/$/, "");
}

function backendUrl() {
  const value = process.env.OAUTH_BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5001}`;
  let parsed;
  try { parsed = new URL(value); } catch { throw new OAuthError("oauth_not_configured", 503); }
  if ((process.env.NODE_ENV === "production" && parsed.protocol !== "https:") || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new OAuthError("oauth_not_configured", 503);
  }
  return parsed.origin;
}

function providerConfig(provider) {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new OAuthError("provider_not_configured", 503);
    return { provider, clientId, clientSecret };
  }
  if (provider === "microsoft") {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenant = (process.env.MICROSOFT_TENANT_ID || "common").trim();
    if (!clientId || !clientSecret || !MICROSOFT_TENANT_PATTERN.test(tenant)) {
      throw new OAuthError("provider_not_configured", 503);
    }
    return { provider, clientId, clientSecret, tenant };
  }
  throw new OAuthError("unsupported_provider", 404);
}

function callbackUrl(provider) {
  return `${backendUrl()}/api/auth/oauth/${provider}/callback`;
}

function authorizationEndpoint(config) {
  return config.provider === "google"
    ? "https://accounts.google.com/o/oauth2/v2/auth"
    : `https://login.microsoftonline.com/${encodeURIComponent(config.tenant)}/oauth2/v2.0/authorize`;
}

function tokenEndpoint(config) {
  return config.provider === "google"
    ? "https://oauth2.googleapis.com/token"
    : `https://login.microsoftonline.com/${encodeURIComponent(config.tenant)}/oauth2/v2.0/token`;
}

function makeAuthorizationUrl(config, state, nonce, verifier) {
  const url = new URL(authorizationEndpoint(config));
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: callbackUrl(config.provider),
    response_type: "code",
    response_mode: "query",
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account"
  }).toString();
  return url.toString();
}

async function startAuthorization(provider, linkUserId = null) {
  const config = providerConfig(provider);
  const state = randomValue();
  const nonce = randomValue();
  const verifier = randomValue(48);
  await db.query("DELETE FROM oauth_login_attempts WHERE expires_at < UTC_TIMESTAMP() LIMIT 500");
  await db.query(
    `INSERT INTO oauth_login_attempts (state_hash, provider, nonce, code_verifier, link_user_id, expires_at)
     VALUES (?, ?, ?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))`,
    [digest(state), provider, nonce, verifier, linkUserId, OAUTH_TTL_SECONDS]
  );
  return makeAuthorizationUrl(config, state, nonce, verifier);
}

router.post("/:provider/start", async (req, res) => {
  try {
    res.json({ success: true, authorizationUrl: await startAuthorization(req.params.provider) });
  } catch (error) {
    if (error instanceof OAuthError) return res.status(error.status).json({ success: false, code: error.code });
    console.error("OAuth start error:", error.code || error.name || "Error");
    res.status(503).json({ success: false, code: "oauth_unavailable" });
  }
});

router.post("/:provider/link", authMiddleware, async (req, res) => {
  try {
    const issuedAt = Number(req.user.iat || 0);
    if (!issuedAt || Date.now() / 1000 - issuedAt > 600) {
      return res.status(428).json({ success: false, code: "reauthentication_required" });
    }
    const url = await startAuthorization(req.params.provider, req.user.user_id);
    res.json({ success: true, authorizationUrl: url });
  } catch (error) {
    if (error instanceof OAuthError) return res.status(error.status).json({ success: false, code: error.code });
    console.error("OAuth link start error:", error.code || error.name || "Error");
    res.status(503).json({ success: false, code: "oauth_unavailable" });
  }
});

async function takeAttempt(provider, state) {
  if (typeof state !== "string" || state.length < 32 || state.length > 128) throw new OAuthError("invalid_state");
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      "SELECT provider, nonce, code_verifier, link_user_id FROM oauth_login_attempts WHERE state_hash = ? AND expires_at > UTC_TIMESTAMP() FOR UPDATE",
      [digest(state)]
    );
    if (!rows.length) throw new OAuthError("invalid_state");
    await connection.query("DELETE FROM oauth_login_attempts WHERE state_hash = ?", [digest(state)]);
    await connection.commit();
    const attempt = rows[0];
    if (attempt.provider !== provider) throw new OAuthError("invalid_state");
    return attempt;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

async function exchangeProviderCode(config, code, verifier) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: callbackUrl(config.provider),
    grant_type: "authorization_code",
    code_verifier: verifier
  });
  const response = await fetch(tokenEndpoint(config), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new OAuthError("provider_token_exchange_failed", 502);
  const result = await response.json();
  if (typeof result.id_token !== "string") throw new OAuthError("invalid_provider_token", 401);
  return result.id_token;
}

async function verifyIdentityToken(provider, token, config, expectedNonce) {
  josePromise ||= import("jose");
  const { createRemoteJWKSet, jwtVerify } = await josePromise;
  if (provider === "google") {
    googleJwks ||= createRemoteJWKSet(GOOGLE_JWKS_URL);
    const { payload } = await jwtVerify(token, googleJwks, {
      algorithms: ["RS256"], issuer: GOOGLE_ISSUERS, audience: config.clientId,
      requiredClaims: ["sub", "nonce"], maxTokenAge: "10 minutes", clockTolerance: 5
    });
    if (payload.nonce !== expectedNonce || payload.email_verified !== true) throw new OAuthError("unverified_provider_identity", 401);
    return { subject: payload.sub, email: payload.email, name: payload.name };
  }
  microsoftJwks ||= createRemoteJWKSet(MICROSOFT_JWKS_URL);
  const { payload } = await jwtVerify(token, microsoftJwks, {
    algorithms: ["RS256"], audience: config.clientId,
    requiredClaims: ["sub", "nonce", "tid"], maxTokenAge: "10 minutes", clockTolerance: 5
  });
  const tenantId = String(payload.tid);
  if (!/^[0-9a-f-]{36}$/i.test(tenantId) || payload.iss !== `https://login.microsoftonline.com/${tenantId}/v2.0` || payload.nonce !== expectedNonce) {
    throw new OAuthError("invalid_provider_token", 401);
  }
  return { subject: payload.sub, email: payload.email || payload.preferred_username, name: payload.name };
}

function normalizedIdentity(profile) {
  const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OAuthError("provider_email_unavailable", 400);
  const name = typeof profile.name === "string" && profile.name.trim()
    ? profile.name.trim().slice(0, 160)
    : email.slice(0, 160);
  if (typeof profile.subject !== "string" || !profile.subject || profile.subject.length > 255) throw new OAuthError("invalid_provider_token", 401);
  return { email, name, subject: profile.subject };
}

async function resolveUser(provider, identity, linkUserId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [identities] = await connection.query(
      "SELECT user_id FROM oauth_identities WHERE provider = ? AND provider_subject = ? FOR UPDATE",
      [provider, identity.subject]
    );
    let userId;
    if (linkUserId) {
      const [users] = await connection.query("SELECT user_id FROM users WHERE user_id = ? FOR UPDATE", [linkUserId]);
      if (!users.length) throw new OAuthError("account_unavailable", 401);
      if (identities.length && Number(identities[0].user_id) !== Number(linkUserId)) throw new OAuthError("provider_already_linked", 409);
      userId = Number(linkUserId);
      if (!identities.length) {
        await connection.query(
          "INSERT INTO oauth_identities (user_id, provider, provider_subject, email) VALUES (?, ?, ?, ?)",
          [userId, provider, identity.subject, identity.email]
        );
      }
    } else if (identities.length) {
      userId = Number(identities[0].user_id);
    } else {
      const [existingUsers] = await connection.query("SELECT user_id FROM users WHERE email = ? FOR UPDATE", [identity.email]);
      if (existingUsers.length) throw new OAuthError("account_exists", 409);
      const randomPassword = crypto.randomBytes(48).toString("base64url");
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const [created] = await connection.query(
        `INSERT INTO users (full_name, email, password_hash)
         VALUES (?, ?, ?)`,
        [identity.name, identity.email, passwordHash]
      );
      userId = Number(created.insertId);
      await connection.query(
        "INSERT INTO oauth_identities (user_id, provider, provider_subject, email) VALUES (?, ?, ?, ?)",
        [userId, provider, identity.subject, identity.email]
      );
    }
    const code = randomValue();
    await connection.query("DELETE FROM oauth_login_codes WHERE expires_at < UTC_TIMESTAMP() LIMIT 500");
    await connection.query(
      `INSERT INTO oauth_login_codes (code_hash, user_id, expires_at)
       VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? SECOND))`,
      [digest(code), userId, 120]
    );
    await connection.commit();
    return { code, userId };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

function frontendRedirect(path, params = {}) {
  const url = new URL(path, frontendUrl());
  for (const [key, value] of Object.entries(params)) if (value) url.searchParams.set(key, value);
  return url.toString();
}

router.get("/:provider/callback", async (req, res) => {
  let provider;
  try {
    provider = req.params.provider;
    const config = providerConfig(provider);
    const attempt = await takeAttempt(provider, req.query.state);
    if (req.query.error || typeof req.query.code !== "string") throw new OAuthError("provider_cancelled", 400);
    const idToken = await exchangeProviderCode(config, req.query.code, attempt.code_verifier);
    const verified = await verifyIdentityToken(provider, idToken, config, attempt.nonce);
    const identity = normalizedIdentity(verified);
    const result = await resolveUser(provider, identity, attempt.link_user_id ? Number(attempt.link_user_id) : null);
    const returnUrl = new URL("/oauth/callback", frontendUrl());
    returnUrl.hash = new URLSearchParams({ code: result.code }).toString();
    res.redirect(303, returnUrl.toString());
  } catch (error) {
    if (error instanceof OAuthError) return res.redirect(303, frontendRedirect("/login", { oauthError: error.code }));
    console.error("OAuth callback error:", error.code || error.name || "Error");
    try { res.redirect(303, frontendRedirect("/login", { oauthError: "oauth_failed" })); }
    catch { res.status(500).json({ success: false, code: "oauth_failed" }); }
  }
});

router.post("/exchange", async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  if (code.length < 32 || code.length > 128 || !process.env.JWT_SECRET) {
    return res.status(400).json({ success: false, message: "This sign-in link is invalid or expired. Please try again." });
  }
  const connection = await db.getConnection();
  let userId;
  try {
    await connection.beginTransaction();
    const [codes] = await connection.query(
      "SELECT user_id FROM oauth_login_codes WHERE code_hash = ? AND expires_at > UTC_TIMESTAMP() FOR UPDATE",
      [digest(code)]
    );
    if (!codes.length) {
      await connection.rollback();
      return res.status(401).json({ success: false, message: "This sign-in link is invalid or expired. Please try again." });
    }
    userId = Number(codes[0].user_id);
    await connection.query("DELETE FROM oauth_login_codes WHERE code_hash = ?", [digest(code)]);
    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error("OAuth exchange error:", error.code || error.name || "Error");
    return res.status(503).json({ success: false, message: "Unable to complete sign-in right now." });
  } finally {
    connection.release();
  }
  try {
    const [[user]] = await db.query(
      `SELECT user_id, full_name, email, semester, branch, target_role, account_role,
              college, cgpa, readiness_score, onboarding_completed_at
       FROM users WHERE user_id = ?`, [userId]
    );
    if (!user) return res.status(401).json({ success: false, message: "This account is no longer available." });
    const [[skills], [milestones], [skillCount]] = await Promise.all([
      db.query(
        `SELECT s.skill_name, s.category, us.proficiency_score FROM user_skills us
         JOIN skills s ON s.skill_id = us.skill_id WHERE us.user_id = ?`, [userId]
      ),
      db.query("SELECT milestone_key FROM user_milestones WHERE user_id = ?", [userId]),
      db.query("SELECT COUNT(*) AS total FROM user_skills WHERE user_id = ?", [userId])
    ]);
    const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    if (user.account_role === "admin") {
      try { await db.query("INSERT INTO admin_audit_log (actor_user_id, action) VALUES (?, 'admin.login')", [userId]); }
      catch (error) { console.error("Admin OAuth audit error:", error.code || error.name || "Error"); }
    }
    res.json({
      success: true,
      token,
      user: {
        id: user.user_id, name: user.full_name, email: user.email,
        semester: user.semester == null ? "" : String(user.semester), branch: user.branch || "",
        targetRole: user.target_role || "", accountRole: user.account_role || "student",
        college: user.college || "", cgpa: user.cgpa == null ? "" : String(user.cgpa),
        readinessScore: Number(skillCount.total) > 0 ? Number(user.readiness_score || 0) : null,
        onboardingComplete: Boolean(user.onboarding_completed_at),
        skills: Object.fromEntries(skills.map(row => [row.skill_name, {
          current: Number(row.proficiency_score), required: 0, category: row.category, missing: false
        }])),
        completedMilestones: milestones.map(row => row.milestone_key)
      }
    });
  } catch (error) {
    console.error("OAuth profile error:", error.code || error.name || "Error");
    res.status(503).json({ success: false, message: "Unable to load your account right now." });
  }
});

module.exports = router;
