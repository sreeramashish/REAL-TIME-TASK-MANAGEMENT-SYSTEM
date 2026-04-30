import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: true,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
      state.tasks.sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.tasks.sort((a, b) => {
          if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
    },
  },
});

export const { setTasks, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
