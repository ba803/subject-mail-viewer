const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

class SessionStore {
  constructor() {
    this.sessions = {};
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
        this.sessions = JSON.parse(raw || '{}');
      }
    } catch (err) {
      console.warn('[SessionStore] Could not read sessions file, starting fresh:', err.message);
      this.sessions = {};
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(this.sessions, null, 2), 'utf8');
    } catch (err) {
      console.error('[SessionStore] Failed to write sessions file:', err.message);
    }
  }

  create(data = {}) {
    const token = 'smt_' + crypto.randomBytes(24).toString('hex');
    this.sessions[token] = {
      ...data,
      token,
      updatedAt: Date.now()
    };
    this.save();
    return token;
  }

  get(token) {
    if (!token) return null;
    return this.sessions[token] || null;
  }

  set(token, data = {}) {
    if (!token) return this.create(data);
    this.sessions[token] = {
      ...(this.sessions[token] || {}),
      ...data,
      token,
      updatedAt: Date.now()
    };
    this.save();
    return token;
  }

  delete(token) {
    if (token && this.sessions[token]) {
      delete this.sessions[token];
      this.save();
    }
  }

  getLatestSession() {
    const tokens = Object.keys(this.sessions);
    if (tokens.length === 0) return null;
    // Sort by updatedAt descending
    tokens.sort((a, b) => (this.sessions[b].updatedAt || 0) - (this.sessions[a].updatedAt || 0));
    return this.sessions[tokens[0]];
  }

  clear() {
    this.sessions = {};
    this.save();
  }
}

module.exports = new SessionStore();

