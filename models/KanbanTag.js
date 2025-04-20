const mongoose = require('mongoose');

const KanbanTagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"]
  },
  color: {
    type: String,
    required: [true , "title is required"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('KanbanTag', KanbanTagSchema);
