const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const calculatePriority = (deadline) => {
  const now = new Date();
  const target = new Date(deadline);
  if (target < now) return 100; 
  const diffHours = (target - now) / (1000 * 60 * 60);
  if (diffHours < 24) return 50; 
  if (diffHours < 72) return 30; 
  return 10; 
};


router.get('/', auth, async (req, res) => {
  try {
    let tasks = await Task.find({ user: req.user.id });
    
    
    tasks = tasks.map(task => {
      const updatedPriority = calculatePriority(task.deadline);
      task.priorityScore = updatedPriority;
      return task;
    });

    
    tasks.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      user: req.user.id
    });
    
    newTask.priorityScore = calculatePriority(newTask.deadline);
    const task = await newTask.save();
    
    req.app.get('io').emit('taskCreated', task);
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    
    
    task.priorityScore = calculatePriority(task.deadline);
    
    req.app.get('io').emit('taskUpdated', task);
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await task.deleteOne();
    
    req.app.get('io').emit('taskDeleted', req.params.id);
    
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
