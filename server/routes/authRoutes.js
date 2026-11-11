const express = require('express');
const router = express.Router();
const googleAuthService = require('../services/googleAuthService');
const demoService = require('../services/demoService');
const sessionStore = require('../services/sessionStore');

/**
 * Check current authentication state
 */
router.get('/status', (req, res) => {
  const isOAuthConfigured = googleAuthService.isConfigured();

  if (req.session && req.session.isDemo) {
    return res.json({
      isAuthenticated: true,
      isDemo: true,
      user: req.session.user,
      token: req.sessionToken || req.session.sessionToken || null,
      isOAuthConfigured
    });
  }

  if (req.session && req.session.tokens) {
    return res.json({
      isAuthenticated: true,
      isDemo: false,
      user: req.session.user,
      token: req.sessionToken || req.session.sessionToken || null,
      isOAuthConfigured
    });
  }

  return res.json({
    isAuthenticated: false,
    isDemo: false,
    user: null,
    isOAuthConfigured
  });
});

/**
 * Restore persistent session across page refresh and server restarts
 */
router.post('/restore-session', (req, res) => {
  const { token, user: cachedUser, isDemo } = req.body || {};
  const isOAuthConfigured = googleAuthService.isConfigured();

  // 1. Try finding by token in persistent sessionStore
  let sessionData = token ? sessionStore.get(token) : null;

  // 2. If token expired or not found, but it was demo mode with cached user, re-create demo session
  if (!sessionData && isDemo && cachedUser) {
    const newToken = sessionStore.create({ tokens: null, user: cachedUser, isDemo: true });
    sessionData = sessionStore.get(newToken);
  }

  if (sessionData) {
    req.session.tokens = sessionData.tokens || null;
    req.session.user = sessionData.user;
    req.session.isDemo = Boolean(sessionData.isDemo);
    req.session.sessionToken = sessionData.token;

    return res.json({
      isAuthenticated: true,
      user: sessionData.user,
      isDemo: Boolean(sessionData.isDemo),
      token: sessionData.token,
      isOAuthConfigured
    });
  }

  // 3. Fallback to existing Express cookie session
  if (req.session && (req.session.tokens || req.session.isDemo)) {
    return res.json({
      isAuthenticated: true,
      user: req.session.user,
      isDemo: Boolean(req.session.isDemo),
      token: req.sessionToken || req.session.sessionToken || null,
      isOAuthConfigured
    });
  }

  return res.json({
    isAuthenticated: false,
    isDemo: false,
    user: null,
    isOAuthConfigured
  });
});

/**
 * Get Google OAuth consent URL
 */
router.get('/url', (req, res) => {
  try {
    if (!googleAuthService.isConfigured()) {
      return res.status(400).json({
        error: 'Google OAuth not configured',
        message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the server .env file.'
      });
    }

    // Determine the return URL: check query param, referer, or default
    const clientRedirect = req.query.redirect_to || 
                           (req.headers.referer ? new URL(req.headers.referer).origin + new URL(req.headers.referer).pathname : null) || 
                           process.env.CLIENT_URL || 
                           'https://ba803.github.io/subject-mail-viewer';
    
    // Encode return URL into state object (safe base64url JSON)
    const statePayload = Buffer.from(JSON.stringify({
      nonce: Math.random().toString(36).substring(7),
      returnTo: clientRedirect
    })).toString('base64url');

    req.session.oauthState = statePayload;
    const url = googleAuthService.getAuthUrl(statePayload);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate auth URL', details: err.message });
  }
});

/**
 * Google OAuth Callback
 */
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Default client URL fallback
  let clientUrl = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://ba803.github.io/subject-mail-viewer' : 'http://localhost:5173');

  // Extract returnTo from state if provided
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded && decoded.returnTo) {
        clientUrl = decoded.returnTo;
      }
    } catch {
      // not JSON base64url state, keep default clientUrl
    }
  }

  // Helper to safely append query params
  const appendQuery = (baseUrl, params) => {
    try {
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      return url.toString();
    } catch {
      const sep = baseUrl.includes('?') ? '&' : '?';
      const qs = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      return `${baseUrl}${sep}${qs}`;
    }
  };

  if (error) {
    console.error('Google OAuth error from callback:', error);
    return res.redirect(appendQuery(clientUrl, { auth_error: error }));
  }

  if (!code) {
    return res.redirect(appendQuery(clientUrl, { auth_error: 'missing_code' }));
  }

  try {
    const tokens = await googleAuthService.getTokens(code);
    const profile = await googleAuthService.getUserProfile(tokens);

    // Save in persistent session store
    const sessionToken = sessionStore.create({
      tokens,
      user: profile,
      isDemo: false
    });

    req.session.tokens = tokens;
    req.session.user = profile;
    req.session.isDemo = false;
    req.session.sessionToken = sessionToken;

    // Save session explicitly before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      res.redirect(appendQuery(clientUrl, { auth_success: '1', token: sessionToken }));
    });
  } catch (err) {
    console.error('Failed to exchange auth code:', err);
    res.redirect(appendQuery(clientUrl, { auth_error: err.message }));
  }
});

/**
 * Instant One-Click Login with your Gmail address (Zero Cloud Console setup required)
 */
router.post('/quick-login', (req, res) => {
  const { email, name } = req.body || {};
  const user = demoService.setCustomUser(email, name);

  const sessionToken = sessionStore.create({
    tokens: null,
    user,
    isDemo: true
  });

  req.session.isDemo = true;
  req.session.tokens = null;
  req.session.user = user;
  req.session.sessionToken = sessionToken;

  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to initialize session' });
    }
    res.json({
      success: true,
      message: `Signed in as ${user.email}`,
      user,
      isDemo: true,
      token: sessionToken
    });
  });
});

/**
 * In-App Google OAuth Credentials Saver (No need to manually open .env files!)
 */
router.post('/save-credentials', (req, res) => {
  const { clientId, clientSecret } = req.body || {};

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Both Client ID and Client Secret are required' });
  }

  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../.env');

  try {
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Replace or append GOOGLE_CLIENT_ID
    if (/^GOOGLE_CLIENT_ID=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^GOOGLE_CLIENT_ID=.*$/m, `GOOGLE_CLIENT_ID=${clientId.trim()}`);
    } else {
      envContent += `\nGOOGLE_CLIENT_ID=${clientId.trim()}`;
    }

    // Replace or append GOOGLE_CLIENT_SECRET
    if (/^GOOGLE_CLIENT_SECRET=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^GOOGLE_CLIENT_SECRET=.*$/m, `GOOGLE_CLIENT_SECRET=${clientSecret.trim()}`);
    } else {
      envContent += `\nGOOGLE_CLIENT_SECRET=${clientSecret.trim()}`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    // Update in-memory process.env
    process.env.GOOGLE_CLIENT_ID = clientId.trim();
    process.env.GOOGLE_CLIENT_SECRET = clientSecret.trim();

    res.json({
      success: true,
      message: 'Google Cloud OAuth Credentials saved successfully! You can now use official Sign in with Google.'
    });
  } catch (err) {
    console.error('Failed to save .env credentials:', err);
    res.status(500).json({ error: 'Failed to write credentials to .env file', details: err.message });
  }
});

/**
 * Start instant Demo Mode session
 */
router.post('/demo', (req, res) => {
  const user = demoService.getDemoUser();

  const sessionToken = sessionStore.create({
    tokens: null,
    user,
    isDemo: true
  });

  req.session.isDemo = true;
  req.session.tokens = null;
  req.session.user = user;
  req.session.sessionToken = sessionToken;

  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to initialize demo session' });
    }
    res.json({
      success: true,
      message: 'Demo mode activated',
      user,
      isDemo: true,
      token: sessionToken
    });
  });
});

/**
 * Logout - Clears local session and persistent token
 */
router.post('/logout', (req, res) => {
  const token = req.sessionToken || req.session?.sessionToken || req.body?.token;
  if (token) {
    sessionStore.delete(token);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('subject_mail_sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * Disconnect Google Account - Revokes Google token and clears session
 */
router.post('/disconnect', async (req, res) => {
  const token = req.sessionToken || req.session?.sessionToken || req.body?.token;
  if (token) {
    sessionStore.delete(token);
  }

  try {
    const tokens = req.session ? req.session.tokens : null;
    if (tokens && tokens.access_token) {
      await googleAuthService.revokeToken(tokens.access_token);
    }
  } catch (err) {
    console.warn('Revoke warning:', err.message);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to disconnect account' });
    }
    res.clearCookie('subject_mail_sid');
    res.json({ success: true, message: 'Google account disconnected and tokens revoked successfully' });
  });
});

module.exports = router;


