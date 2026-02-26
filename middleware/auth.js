// Middleware: must be logged in
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware: must be admin
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  if (req.session.userRole !== 'admin') {
    return res.status(403).render('error', {
      message: 'غير مصرح لك بالوصول إلى هذه الصفحة',
      user: req.session
    });
  }
  next();
};

// Middleware: attach user info to all views
const attachUser = (req, res, next) => {
  res.locals.currentUser = req.session.userId ? {
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail,
    role: req.session.userRole
  } : null;
  next();
};

module.exports = { requireAuth, requireAdmin, attachUser };
