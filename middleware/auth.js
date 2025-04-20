const passport = require('passport');
const jwt = require('jsonwebtoken');

// Middleware for JWT authentication
exports.authenticateJWT = passport.authenticate('jwt', { session: false });

// Middleware for role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    next();
  };
};

// Generate JWT token
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    'your-jwt-secret', // Use environment variable in production
    { expiresIn: '1d' }
  );
};
