import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import App from '../App';
import api from '../api';

const mock = new MockAdapter(api);

const seedTasks = [
  { id: 1, title: 'Test task 1', completed: false },
  { id: 2, title: 'Test task 2', completed: true },
];

describe('App', () => {
  beforeEach(() => {
    mock.reset();
    mock.onGet('/health').reply(200, { status: 'healthy' });
    mock.onGet('/api/tasks').reply(200, {
      tasks: seedTasks,
      count: seedTasks.length,
    });
  });

  it('renders header and title', async () => {
    render(<App />);
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it('loads and displays tasks from API', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test task 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Test task 2')).toBeInTheDocument();
  });

  it('shows healthy backend status when health endpoint succeeds', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('status-bar')).toHaveTextContent('healthy');
    });
  });

  it('shows unreachable status when health endpoint fails', async () => {
    mock.reset();
    mock.onGet('/health').networkError();
    mock.onGet('/api/tasks').reply(200, { tasks: [], count: 0 });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('status-bar')).toHaveTextContent('unreachable');
    });
  });

  it('shows completed count in status bar', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('status-bar')).toHaveTextContent(
        '1 of 2 complete'
      );
    });
  });

  it('shows empty state when no tasks', async () => {
    mock.reset();
    mock.onGet('/health').reply(200, { status: 'healthy' });
    mock.onGet('/api/tasks').reply(200, { tasks: [], count: 0 });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mock.reset();
    mock.onGet('/health').reply(200, { status: 'healthy' });
    mock.onGet('/api/tasks').networkError();

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });

  it('adds a new task', async () => {
    const newTask = { id: 3, title: 'New task', completed: false };
    mock.onPost('/api/tasks').reply(201, newTask);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test task 1')).toBeInTheDocument();
    });

    const input = screen.getByLabelText('Task title');
    const button = screen.getByRole('button', { name: /add/i });

    await userEvent.type(input, 'New task');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('New task')).toBeInTheDocument();
    });
  });

  it('toggles task completion', async () => {
    const updated = { id: 1, title: 'Test task 1', completed: true };
    mock.onPut('/api/tasks/1').reply(200, updated);

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test task 1')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText('Toggle Test task 1');
    await userEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByTestId('status-bar')).toHaveTextContent(
        '2 of 2 complete'
      );
    });
  });

  it('deletes a task', async () => {
    mock.onDelete('/api/tasks/1').reply(200, { message: 'Task deleted' });

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test task 1')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText('Delete Test task 1');
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Test task 1')).not.toBeInTheDocument();
    });
  });

  it('does not submit empty task', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Test task 1')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /add/i });
    expect(button).toBeDisabled();
  });
});
