const mongoose = require('mongoose');

const KanbanTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true , "title is required"]
  },
  description: {
    type: String
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KanbanColumn',
    required: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KanbanTag'
  }],
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = mongoose.model('KanbanTask', KanbanTaskSchema);