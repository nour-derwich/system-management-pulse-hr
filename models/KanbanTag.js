const mongoose = require('mongoose');

const KanbanTagSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"]
  },
  color: {
    type: String,
    required: [true , "title is required"]
  }
}, { timestamps: true });

module.exports = mongoose.model('KanbanTag', KanbanTagSchema);
