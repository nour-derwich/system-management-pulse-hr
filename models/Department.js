const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true , "name is required"]
  },
  location: {
    type: String
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
