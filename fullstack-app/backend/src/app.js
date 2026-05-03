const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));

  // Logging (skip during tests to keep output clean)
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Rate limiting — 100 requests per 15 minutes per IP
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // In-memory data store for demo purposes
  let tasks = [
    { id: 1, title: 'Set up AKS cluster', completed: true },
    { id: 2, title: 'Configure ACR', completed: true },
    { id: 3, title: 'Build CI/CD pipeline', completed: false },
  ];
  let nextId = 4;

  // Health check — used by Kubernetes liveness/readiness probes
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Backend API running',
      version: '1.0.0',
      endpoints: ['/health', '/api/tasks'],
    });
  });

  // Get all tasks
  app.get('/api/tasks', (req, res) => {
    res.json({ tasks, count: tasks.length });
  });

  // Get single task
  app.get('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });

  // Create task
  app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title too long (max 200 chars)' });
    }
    const newTask = {
      id: nextId++,
      title: title.trim(),
      completed: false,
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
  });

  // Update task (toggle complete)
  app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (typeof req.body.completed === 'boolean') {
      task.completed = req.body.completed;
    }
    if (typeof req.body.title === 'string' && req.body.title.trim().length > 0) {
      task.title = req.body.title.trim();
    }
    res.json(task);
  });

  // Delete task
  app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task id' });
    }
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const removed = tasks.splice(index, 1)[0];
    res.json({ message: 'Task deleted', task: removed });
  });

  // Reset endpoint — useful for tests
  app.post('/api/_reset', (req, res) => {
    if (process.env.NODE_ENV !== 'test') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    tasks = [];
    nextId = 1;
    res.json({ message: 'Reset complete' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

module.exports = createApp;
