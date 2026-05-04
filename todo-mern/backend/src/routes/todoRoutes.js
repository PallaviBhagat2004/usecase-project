const express = require('express');
const router = express.Router();
const {
  getAllTodos,
  createTodo,
  getTodoById,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');

router.route('/').get(getAllTodos).post(createTodo);
router.route('/:id').get(getTodoById).put(updateTodo).delete(deleteTodo);

module.exports = router;
