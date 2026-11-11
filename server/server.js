const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const mailRoutes = require('./routes/mailRoutes');

const app = express();
const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Trust reverse proxy (essential for production deployments behind Render, Railway, Fly.io, etc.)
app.set('trust proxy', 1);

// Security Headers with relaxed CSP for dev & mail HTML rendering
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Logging
app.use(morgan('dev'));

// CORS Setup - supports local Vite dev server and production frontend (e.g. GitHub Pages)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (CLIENT_URL) {
  CLIENT_URL.split(',').forEach(u => {
    const clean = u.trim().replace(/\/+$/, '');
    if (clean && !allowedOrigins.includes(clean)) {
      allowedOrigins.push(clean);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, mobile, or requests without Origin header
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.github.io') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session configuration
const isProd = process.env.NODE_ENV === 'production';
app.use(
  session({
    name: 'subject_mail_sid',
    secret: process.env.SESSION_SECRET || 'subject_mail_secret_dev_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd, // Set true if running over HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Bearer Token Session Hydration Middleware (guarantees session persistence across refresh & restarts)
const sessionStore = require('./services/sessionStore');
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.query && req.query.auth_token) {
    token = req.query.auth_token;
  }

  if (token) {
    const sessionData = sessionStore.get(token);
    if (sessionData) {
      req.sessionToken = token;
      req.session = req.session || {};
      if (sessionData.tokens) req.session.tokens = sessionData.tokens;
      if (sessionData.user) req.session.user = sessionData.user;
      if (typeof sessionData.isDemo !== 'undefined') req.session.isDemo = sessionData.isDemo;
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    demoModeEnabled: process.env.ENABLE_DEMO_MODE === 'true',
    oauthConfigured: Boolean(
      process.env.GOOGLE_CLIENT_ID &&
      !process.env.GOOGLE_CLIENT_ID.includes('your_google_client_id')
    )
  });
});

// Frontend serving / API root handler
const clientDist = path.join(__dirname, '../client/dist');
const indexHtmlPath = path.join(clientDist, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(indexHtmlPath);
  });
} else {
  // Frontend is deployed separately on GitHub Pages
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Subject Mail Viewer Backend API',
      frontendUrl: CLIENT_URL,
      healthCheck: '/api/health',
      timestamp: new Date().toISOString()
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

const HOST = process.env.HOST || '0.0.0.0';

function startServer(portToTry) {
  const server = app.listen(portToTry, HOST, () => {
    console.log(`====================================================`);
    console.log(` Subject Mail Viewer Backend`);
    console.log(` Running on: http://${HOST}:${portToTry}`);
    console.log(` Client URL: ${CLIENT_URL}`);
    console.log(` Google OAuth Configured: ${Boolean(process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.includes('your_google_client_id'))}`);
    console.log(` Demo Mode: ${process.env.ENABLE_DEMO_MODE === 'true' ? 'Enabled' : 'Disabled'}`);
    console.log(`====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
      console.warn(`[SERVER] Port ${portToTry} is reserved or in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('[SERVER] Fatal server error:', err);
    }
  });
}

startServer(Number(PORT));

