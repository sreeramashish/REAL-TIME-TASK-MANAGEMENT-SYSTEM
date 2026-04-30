import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks, addTask, updateTask, deleteTask } from '../store/taskSlice';
import { logout } from '../store/authSlice';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LogOut, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const { tasks, loading } = useSelector(state => state.tasks);

  const [newTask, setNewTask] = useState({ title: '', description: '', category: '', deadline: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setTasks(res.data));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTasks();

    const socket = io(API_URL);
    socket.on('taskCreated', (task) => dispatch(addTask(task)));
    socket.on('taskUpdated', (task) => dispatch(updateTask(task)));
    socket.on('taskDeleted', (taskId) => dispatch(deleteTask(taskId)));

    return () => socket.disconnect();
  }, [dispatch, token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: '', description: '', category: '', deadline: '' });
      setShowForm(false);
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl font-semibold">Loading...</div>;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const todayTasks = tasks.filter(t => t.status === 'Completed' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {}

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Plus size={24} /></div>
            <div><p className="text-sm text-gray-500">Total Tasks</p><p className="text-2xl font-bold">{totalTasks}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle size={24} /></div>
            <div><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold">{completedTasks}</p></div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Clock size={24} /></div>
            <div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold">{pendingTasks}</p></div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-900 flex flex-col justify-center">
            <p className="text-sm opacity-80 font-bold uppercase tracking-wider">SmartTask Insight</p>
            <p className="text-lg font-semibold mt-1">You completed {todayTasks} tasks today! 🚀</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Tasks</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition shadow-sm font-medium">
            <Plus size={18} />
            <span>Add New Task</span>
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Task Title" className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            <input required type="text" placeholder="Category" className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} />
            <textarea required placeholder="Description" className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:col-span-2" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            <input required type="datetime-local" className="border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
            <div className="flex items-end justify-end md:col-span-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-gray-500 hover:text-gray-700 mr-4 font-medium">Cancel</button>
              <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">Save Task</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className={`p-6 rounded-2xl border transition shadow-sm bg-white ${task.priorityScore === 100 ? 'border-red-400 bg-red-50' : 'border-gray-100'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                    {task.priorityScore === 100 && <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center"><AlertCircle size={12} className="mr-1"/> Overdue</span>}
                    {task.priorityScore === 50 && <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-bold">High Priority</span>}
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">{task.category}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{task.description}</p>
                  <div className="flex items-center space-x-4">
                    <p className="text-xs text-gray-400 font-medium">Deadline: {new Date(task.deadline).toLocaleString()}</p>
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Priority Score: {task.priorityScore}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-3">
                  <select
                    className={`text-sm rounded-lg p-2 border font-medium outline-none ${task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button onClick={() => handleDelete(task._id)} className="text-xs text-red-500 hover:text-red-700 font-semibold underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-center py-12 text-gray-500 font-medium">No tasks found. Create one to get started!</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
