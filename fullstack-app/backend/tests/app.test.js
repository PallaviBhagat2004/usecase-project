const request = require('supertest');
const createApp = require('../src/app');

describe('Backend API', () => {
  let app;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    app = createApp();
  });

  describe('Health endpoint', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  describe('Root endpoint', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Backend API running');
      expect(res.body.endpoints).toContain('/api/tasks');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return list of tasks with count', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.count).toBe(res.body.tasks.length);
    });

    it('should return seed tasks on fresh app', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.body.tasks.length).toBeGreaterThan(0);
      expect(res.body.tasks[0]).toHaveProperty('id');
      expect(res.body.tasks[0]).toHaveProperty('title');
      expect(res.body.tasks[0]).toHaveProperty('completed');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return single task by id', async () => {
      const res = await request(app).get('/api/tasks/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/api/tasks/9999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid id', async () => {
      const res = await request(app).get('/api/tasks/abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid task id');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Write tests' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Write tests');
      expect(res.body.completed).toBe(false);
      expect(res.body.id).toBeDefined();
    });

    it('should reject empty title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });

    it('should reject missing title', async () => {
      const res = await request(app).post('/api/tasks').send({});
      expect(res.status).toBe(400);
    });

    it('should reject title over 200 chars', async () => {
      const longTitle = 'a'.repeat(201);
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('too long');
    });

    it('should trim whitespace from title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: '   spaces around   ' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('spaces around');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should toggle task completion', async () => {
      const res = await request(app)
        .put('/api/tasks/1')
        .send({ completed: false });
      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(false);
    });

    it('should update task title', async () => {
      const res = await request(app)
        .put('/api/tasks/1')
        .send({ title: 'Updated title' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/9999')
        .send({ completed: true });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const res = await request(app).delete('/api/tasks/1');
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Task deleted');
    });

    it('should return 404 when deleting non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Route not found');
    });
  });

  describe('Full task lifecycle', () => {
    it('should create, retrieve, update, and delete a task', async () => {
      // Create
      const created = await request(app)
        .post('/api/tasks')
        .send({ title: 'Lifecycle test' });
      expect(created.status).toBe(201);
      const id = created.body.id;

      // Retrieve
      const fetched = await request(app).get(`/api/tasks/${id}`);
      expect(fetched.status).toBe(200);
      expect(fetched.body.title).toBe('Lifecycle test');

      // Update
      const updated = await request(app)
        .put(`/api/tasks/${id}`)
        .send({ completed: true });
      expect(updated.body.completed).toBe(true);

      // Delete
      const deleted = await request(app).delete(`/api/tasks/${id}`);
      expect(deleted.status).toBe(200);

      // Verify deletion
      const notFound = await request(app).get(`/api/tasks/${id}`);
      expect(notFound.status).toBe(404);
    });
  });
});
