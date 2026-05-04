import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddTodo from '../components/AddTodo';

describe('AddTodo', () => {
  it('renders input, priority select, and submit button', () => {
    render(<AddTodo onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('button is disabled when input is empty', () => {
    render(<AddTodo onAdd={vi.fn()} />);
    expect(screen.getByRole('button', { name: /add todo/i })).toBeDisabled();
  });

  it('button is enabled once input has non-whitespace text', async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);
    await user.type(screen.getByPlaceholderText('Add a new todo...'), 'Walk the dog');
    expect(screen.getByRole('button', { name: /add todo/i })).toBeEnabled();
  });

  it('calls onAdd with title and selected priority on submit', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    await user.type(screen.getByPlaceholderText('Add a new todo...'), 'Fix bug');
    await user.selectOptions(screen.getByLabelText('Priority'), 'high');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(mockOnAdd).toHaveBeenCalledOnce();
    expect(mockOnAdd).toHaveBeenCalledWith({ title: 'Fix bug', priority: 'high' });
  });

  it('clears the input after successful submit', async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText('Add a new todo...');

    await user.type(input, 'Temporary task');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(input).toHaveValue('');
  });

  it('resets priority to medium after submit', async () => {
    const user = userEvent.setup();
    render(<AddTodo onAdd={vi.fn()} />);

    await user.type(screen.getByPlaceholderText('Add a new todo...'), 'Task');
    await user.selectOptions(screen.getByLabelText('Priority'), 'low');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    expect(screen.getByLabelText('Priority')).toHaveValue('medium');
  });

  it('does not submit when input contains only whitespace', async () => {
    const mockOnAdd = vi.fn();
    const user = userEvent.setup();
    render(<AddTodo onAdd={mockOnAdd} />);

    await user.type(screen.getByPlaceholderText('Add a new todo...'), '   ');
    expect(screen.getByRole('button', { name: /add todo/i })).toBeDisabled();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });
});
