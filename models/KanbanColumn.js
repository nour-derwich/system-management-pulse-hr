const mongoose = require('mongoose');

const KanbanColumnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"]
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KanbanBoard',
    required: [true, "board is required"]
  },
  order: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('KanbanColumn', KanbanColumnSchema);