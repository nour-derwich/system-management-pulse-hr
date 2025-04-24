const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Position name is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, "Department is required"]
  },
  salary: {
    type: Number,
    required: [true, "Salary is required"]
  }
}, { timestamps: true });

module.exports = mongoose.model('Position', PositionSchema);
