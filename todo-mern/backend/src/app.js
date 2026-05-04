const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const todoRoutes = require('./routes/todoRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Skip DB connection during tests — tests handle their own connection via MongoMemoryServer
if (process.env.NODE_ENV !== 'test') {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected:', MONGODB_URI))
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/todos', todoRoutes);
app.use(errorHandler);

module.exports = app;
