import React, { useState, useEffect, useCallback } from 'react';
import { taskApi } from './api';
import TaskItem from './components/TaskItem';
import AddTaskForm from './components/AddTaskForm';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  const loadTasks = useCallback(async () => {
    try {
      const data = await taskApi.getAll();
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      await taskApi.health();
      setBackendStatus('healthy');
    } catch {
      setBackendStatus('unreachable');
    }
  }, []);

  useEffect(() => {
    checkHealth();
    loadTasks();
  }, [checkHealth, loadTasks]);

  const handleAdd = async (title) => {
    try {
      const newTask = await taskApi.create(title);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleToggle = async (task) => {
    try {
      const updated = await taskApi.update(task.id, {
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="container">
      <div className="header">
        <h1>Task Manager</h1>
        <p>AKS CI/CD demo · React + Node.js + Express</p>
      </div>

      <div
        className={`status-bar ${
          backendStatus === 'unreachable' ? 'error' : ''
        }`}
        data-testid="status-bar"
      >
        <span>
          Backend: <strong>{backendStatus}</strong>
        </span>
        <span>
          {completedCount} of {tasks.length} complete
        </span>
      </div>

      {error && (
        <div className="status-bar error" role="alert">
          {error}
        </div>
      )}

      <AddTaskForm onAdd={handleAdd} />

      <div className="task-list">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            No tasks yet. Add one above to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
