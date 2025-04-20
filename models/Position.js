const mongoose = require('mongoose');

const PositionSchema = new mongoose.Schema({
  designation: {
    type: String,
    required: [true , "designation is required"]
  } 
}, { timestamps: true });

module.exports = mongoose.model('Position', PositionSchema);