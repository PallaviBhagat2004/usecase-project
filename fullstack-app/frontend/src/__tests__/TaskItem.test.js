import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../components/TaskItem';

describe('TaskItem', () => {
  const task = { id: 1, title: 'Buy groceries', completed: false };

  it('renders task title', () => {
    render(<TaskItem task={task} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });

  it('shows unchecked checkbox for incomplete task', () => {
    render(<TaskItem task={task} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('shows checked checkbox for completed task', () => {
    const completed = { ...task, completed: true };
    render(
      <TaskItem task={completed} onToggle={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('applies completed style when task is done', () => {
    const completed = { ...task, completed: true };
    render(
      <TaskItem task={completed} onToggle={() => {}} onDelete={() => {}} />
    );
    expect(screen.getByText('Buy groceries')).toHaveClass('completed');
  });

  it('calls onToggle when checkbox clicked', async () => {
    const onToggle = jest.fn();
    render(<TaskItem task={task} onToggle={onToggle} onDelete={() => {}} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(task);
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    render(<TaskItem task={task} onToggle={() => {}} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
