const mongoose = require('mongoose');

const KanbanBoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true , " name is required"]
  },
  description: {
    type: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
   members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
}, { timestamps: true });

module.exports = mongoose.model('KanbanBoard', KanbanBoardSchema);
