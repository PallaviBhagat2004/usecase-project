import React from 'react';

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className="task-item" data-testid={`task-${task.id}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Toggle ${task.title}`}
      />
      <span className={`title ${task.completed ? 'completed' : ''}`}>
        {task.title}
      </span>
      <button
        className="delete-btn"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
      >
        Delete
      </button>
    </div>
  );
}

export default TaskItem;
