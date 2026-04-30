const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  deadline: { type: Date, required: true },
  priorityScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
