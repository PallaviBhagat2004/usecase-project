import { render, screen } from '@testing-library/react';
import TodoList from '../components/TodoList';

const mockTodos = [
  { _id: '1', title: 'First Todo', completed: false, priority: 'low' },
  { _id: '2', title: 'Second Todo', completed: true, priority: 'high' },
  { _id: '3', title: 'Third Todo', completed: false, priority: 'medium' },
];

describe('TodoList', () => {
  it('shows empty message when todos array is empty', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('No todos to show.')).toBeInTheDocument();
  });

  it('renders all todo items', () => {
    render(<TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('First Todo')).toBeInTheDocument();
    expect(screen.getByText('Second Todo')).toBeInTheDocument();
    expect(screen.getByText('Third Todo')).toBeInTheDocument();
  });

  it('renders the correct number of list items', () => {
    render(<TodoList todos={mockTodos} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('passes onToggle and onDelete down to each TodoItem', () => {
    const mockToggle = vi.fn();
    const mockDelete = vi.fn();
    render(<TodoList todos={mockTodos} onToggle={mockToggle} onDelete={mockDelete} />);

    // Three checkboxes and three delete buttons should be present
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(3);
  });
});
