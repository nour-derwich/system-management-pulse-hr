const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

module.exports = function(passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await User.findOne({ email });
          
          // If user doesn't exist
          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }
          
          // Check password
          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }
          
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  
  // JWT Strategy
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your-jwt-secret' // Use environment variable in production
  };
  
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        
        if (user) {
          return done(null, user);
        }
        
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};