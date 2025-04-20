const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },
   email: {
      type: String,
      required: [true, 'email is required'],
      validate: {
        validator: (val) => /^([\w-\.]+@([\w-]+\.)+[\w-]+)?$/.test(val),
        message: 'Please enter a valid email',
      }},
  password: {
    type: String,
   
    required: [true, 'Password is required'],
      minlength: [8, 'Password must be atleast 8 characters or longer']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
