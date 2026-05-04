import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App';
import todoService from '../services/todoService';

vi.mock('../services/todoService', () => ({
  default: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockTodos = [
  { _id: '1', title: 'Buy milk', completed: false, priority: 'low' },
  { _id: '2', title: 'Write code', completed: true, priority: 'high' },
];

beforeEach(() => {
  vi.clearAllMocks();
  todoService.getAll.mockResolvedValue(mockTodos);
});

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /todo app/i })).toBeInTheDocument();
  });

  it('shows loading indicator while fetching', () => {
    todoService.getAll.mockReturnValue(new Promise(() => {})); // never resolves
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays todos after loading completes', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
      expect(screen.getByText('Write code')).toBeInTheDocument();
    });
  });

  it('shows correct stats after load', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Total: 2/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Completed: 1/)).toBeInTheDocument();
    });
  });

  it('shows error banner when fetch fails', async () => {
    todoService.getAll.mockRejectedValue(new Error('Network error'));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch todos');
    });
  });

  it('dismisses error banner when × is clicked', async () => {
    todoService.getAll.mockRejectedValue(new Error('Network error'));
    render(<App />);
    await waitFor(() => screen.getByRole('alert'));
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('filters to active todos only', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Buy milk'));
    fireEvent.click(screen.getByRole('button', { name: /active/i }));
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.queryByText('Write code')).not.toBeInTheDocument();
  });

  it('filters to completed todos only', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Write code'));
    fireEvent.click(screen.getByRole('button', { name: /completed/i }));
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    expect(screen.getByText('Write code')).toBeInTheDocument();
  });

  it('adds a new todo to the list', async () => {
    const newTodo = { _id: '3', title: 'New Task', completed: false, priority: 'medium' };
    todoService.create.mockResolvedValue(newTodo);

    render(<App />);
    await waitFor(() => screen.getByText('Buy milk'));

    const input = screen.getByPlaceholderText('Add a new todo...');
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }));

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });

  it('removes a todo from the list on delete', async () => {
    todoService.remove.mockResolvedValue();
    render(<App />);
    await waitFor(() => screen.getByText('Buy milk'));

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
    });
  });
});
