/**
 * Middleware to protect routes and attach user authentication context
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.isDemo) {
    req.isDemo = true;
    req.user = req.session.user;
    return next();
  }

  if (req.session && req.session.tokens) {
    req.isDemo = false;
    req.tokens = req.session.tokens;
    req.user = req.session.user;
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Please sign in with Google or enable Demo Mode to view messages.'
  });
}

module.exports = {
  requireAuth
};

