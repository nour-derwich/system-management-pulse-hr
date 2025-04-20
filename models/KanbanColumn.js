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
  }
}, { timestamps: true });

module.exports = mongoose.model('KanbanColumn', KanbanColumnSchema);