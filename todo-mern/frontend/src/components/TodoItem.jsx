function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li
      className={`todo-item priority-${todo.priority}${todo.completed ? ' completed' : ''}`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo._id, e.target.checked)}
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <span className="todo-title">{todo.title}</span>
      <span className={`priority-badge ${todo.priority}`}>{todo.priority}</span>
      <button
        className="delete-btn"
        onClick={() => onDelete(todo._id)}
        aria-label={`Delete "${todo.title}"`}
      >
        Delete
      </button>
    </li>
  );
}

export default TodoItem;
