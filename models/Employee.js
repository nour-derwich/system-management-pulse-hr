const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true , "FirstName is required"]
  },
  lastName: {
    type: String,
    required: [true , "LastName is required"]
  },
   email: {
      type: String,
      required: [true, 'email is required'],
      validate: {
        validator: (val) => /^([\w-\.]+@([\w-]+\.)+[\w-]+)?$/.test(val),
        message: 'Please enter a valid email',
      },
    },
  phone: {
    type: String
  },
  birthday: {
    type: Date
  },
  sexe: {
    type: String
  },
  avatar: {
    type: String
  },
  hireDate: {
    type: Date
  },
  endContract: {
    type: Date
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  additionalInfos: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);