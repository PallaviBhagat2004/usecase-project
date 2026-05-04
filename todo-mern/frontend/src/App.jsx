import { useState, useEffect } from 'react';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import todoService from './services/todoService';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getAll();
      setTodos(data);
    } catch {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todoData) => {
    try {
      const newTodo = await todoService.create(todoData);
      setTodos((prev) => [newTodo, ...prev]);
    } catch {
      setError('Failed to create todo');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const updated = await todoService.update(id, { completed });
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch {
      setError('Failed to update todo');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoService.remove(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError('Failed to delete todo');
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Todo App</h1>
        <p className="subtitle">MERN Stack</p>
      </header>

      <main className="app-main">
        <AddTodo onAdd={addTodo} />

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="stats">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Completed: {stats.completed}</span>
        </div>

        <div className="filter-bar">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <TodoList todos={filteredTodos} onToggle={toggleTodo} onDelete={deleteTodo} />
        )}
      </main>
    </div>
  );
}

export default App;
