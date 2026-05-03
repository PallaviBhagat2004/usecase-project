import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTaskForm from '../components/AddTaskForm';

describe('AddTaskForm', () => {
  it('renders input and button', () => {
    render(<AddTaskForm onAdd={() => {}} />);
    expect(screen.getByLabelText('Task title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables button when input is empty', () => {
    render(<AddTaskForm onAdd={() => {}} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('enables button when input has text', async () => {
    render(<AddTaskForm onAdd={() => {}} />);
    await userEvent.type(screen.getByLabelText('Task title'), 'New task');
    expect(screen.getByRole('button', { name: /add/i })).toBeEnabled();
  });

  it('calls onAdd with trimmed title on submit', async () => {
    const onAdd = jest.fn().mockResolvedValue();
    render(<AddTaskForm onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText('Task title'), '  New task  ');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith('New task');
  });

  it('clears input after successful submit', async () => {
    const onAdd = jest.fn().mockResolvedValue();
    render(<AddTaskForm onAdd={onAdd} />);
    const input = screen.getByLabelText('Task title');
    await userEvent.type(input, 'New task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(input).toHaveValue('');
  });

  it('does not submit whitespace-only input', async () => {
    const onAdd = jest.fn();
    render(<AddTaskForm onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText('Task title'), '   ');
    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeDisabled();
  });
});
