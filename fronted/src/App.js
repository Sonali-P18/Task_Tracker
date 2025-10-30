import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [insights, setInsights] = useState({});
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [sortBy, setSortBy] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    due_date: '',
    status: 'todo'
  });
  const [loading, setLoading] = useState(false);

  // Fetch tasks and insights
  useEffect(() => {
    fetchTasks();
    fetchInsights();
  }, [filters, sortBy]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (sortBy) params.append('sort_by', sortBy);

      const response = await axios.get(`${API_BASE}/tasks?${params}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${API_BASE}/insights`);
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_BASE}/tasks`, newTask);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        due_date: '',
        status: 'todo'
      });
      fetchTasks();
      fetchInsights();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}`, updates);
      fetchTasks();
      fetchInsights();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'done': return 'status-done';
      case 'in_progress': return 'status-in-progress';
      case 'todo': return 'status-todo';
      default: return '';
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📋 Task Tracker with Smart Insights</h1>
      </header>

      <div className="container">
        {/* Insights Panel */}
        <div className="insights-panel">
          <h2>📊 Smart Insights</h2>
          {insights.summary ? (
            <div className="insight-summary">
              <p className="summary-text">{insights.summary}</p>
              <div className="insight-details">
                <div>Total Tasks: {insights.total_tasks || 0}</div>
                <div>Due Soon: {insights.due_soon_count || 0}</div>
                {insights.status_count && (
                  <div>
                    Status: Todo ({insights.status_count.todo || 0}), 
                    In Progress ({insights.status_count.in_progress || 0}), 
                    Done ({insights.status_count.done || 0})
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Loading insights...</p>
          )}
        </div>

        {/* Add Task Form */}
        <div className="task-form">
          <h2>Add New Task</h2>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <input
                type="text"
                name="title"
                placeholder="Task Title *"
                value={newTask.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="description"
                placeholder="Description"
                value={newTask.description}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="date"
                  name="due_date"
                  value={newTask.due_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>

        {/* Filters and Sorting */}
        <div className="controls">
          <div className="filters">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="sorting">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="tasks-list">
          <h2>Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks found. Add some tasks to get started!</p>
          ) : (
            <div className="tasks-grid">
              {tasks.map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-header">
                    <h3 className="task-title">{task.title}</h3>
                    <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  
                  <div className="task-meta">
                    <div className="due-date">
                      📅 Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                    <div className={`status ${getStatusClass(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>

                    <select
                      value={task.priority}
                      onChange={(e) => handleUpdateTask(task._id, { priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;