import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../components/TodoItem';

const mockTodo = {
  _id: 'abc123',
  title: 'Write tests',
  completed: false,
  priority: 'medium',
};

describe('TodoItem', () => {
  it('renders the todo title', () => {
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('renders the priority badge', () => {
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('medium')).toBeInTheDocument();
  });

  it('checkbox is unchecked for an incomplete todo', () => {
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('checkbox is checked for a completed todo', () => {
    render(
      <TodoItem todo={{ ...mockTodo, completed: true }} onToggle={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggle with id and new checked state when checkbox changes', () => {
    const mockOnToggle = vi.fn();
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockOnToggle).toHaveBeenCalledWith('abc123', true);
  });

  it('calls onDelete with id when Delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    render(<TodoItem todo={mockTodo} onToggle={vi.fn()} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(mockOnDelete).toHaveBeenCalledWith('abc123');
  });

  it('applies "completed" class when todo is done', () => {
    render(
      <TodoItem todo={{ ...mockTodo, completed: true }} onToggle={vi.fn()} onDelete={vi.fn()} />
    );
    expect(screen.getByRole('listitem')).toHaveClass('completed');
  });

  it('applies priority class to the list item', () => {
    render(<TodoItem todo={{ ...mockTodo, priority: 'high' }} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('listitem')).toHaveClass('priority-high');
  });
});
