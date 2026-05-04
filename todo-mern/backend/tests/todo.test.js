// Set test environment before importing app so MongoDB connection is skipped
process.env.NODE_ENV = 'test';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// ─── Health ────────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ─── GET /api/todos ────────────────────────────────────────────────────────────

describe('GET /api/todos', () => {
  it('returns empty array when no todos exist', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.count).toBe(0);
  });

  it('returns all todos sorted by newest first', async () => {
    await request(app).post('/api/todos').send({ title: 'First' });
    await request(app).post('/api/todos').send({ title: 'Second' });

    const res = await request(app).get('/api/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.data[0].title).toBe('Second');
  });
});

// ─── POST /api/todos ───────────────────────────────────────────────────────────

describe('POST /api/todos', () => {
  it('creates a todo with required title', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Buy groceries' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Buy groceries');
    expect(res.body.data.completed).toBe(false);
    expect(res.body.data.priority).toBe('medium');
    expect(res.body.data._id).toBeDefined();
  });

  it('creates a todo with custom priority', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Urgent task', priority: 'high' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.priority).toBe('high');
  });

  it('rejects todo without title (400)', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/title is required/i);
  });

  it('rejects invalid priority value (400)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Task', priority: 'urgent' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('trims whitespace from title', async () => {
    const res = await request(app).post('/api/todos').send({ title: '  Clean desk  ' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Clean desk');
  });
});

// ─── GET /api/todos/:id ────────────────────────────────────────────────────────

describe('GET /api/todos/:id', () => {
  it('returns a todo by valid id', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Find me' });
    const id = created.body.data._id;

    const res = await request(app).get(`/api/todos/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Find me');
  });

  it('returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/todos/6642b3c4e1234567890abcde');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for a malformed id', async () => {
    const res = await request(app).get('/api/todos/not-an-id');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/todos/:id ────────────────────────────────────────────────────────

describe('PUT /api/todos/:id', () => {
  it('updates title and completed flag', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Original' });
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: 'Updated', completed: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Updated');
    expect(res.body.data.completed).toBe(true);
  });

  it('returns 404 when todo does not exist', async () => {
    const res = await request(app)
      .put('/api/todos/6642b3c4e1234567890abcde')
      .send({ title: 'Ghost' });
    expect(res.statusCode).toBe(404);
  });

  it('validates updated priority', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Task' });
    const id = created.body.data._id;

    const res = await request(app).put(`/api/todos/${id}`).send({ priority: 'critical' });
    expect(res.statusCode).toBe(400);
  });
});

// ─── DELETE /api/todos/:id ─────────────────────────────────────────────────────

describe('DELETE /api/todos/:id', () => {
  it('deletes an existing todo', async () => {
    const created = await request(app).post('/api/todos').send({ title: 'Delete me' });
    const id = created.body.data._id;

    const delRes = await request(app).delete(`/api/todos/${id}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app).get(`/api/todos/${id}`);
    expect(getRes.statusCode).toBe(404);
  });

  it('returns 404 when todo does not exist', async () => {
    const res = await request(app).delete('/api/todos/6642b3c4e1234567890abcde');
    expect(res.statusCode).toBe(404);
  });
});
