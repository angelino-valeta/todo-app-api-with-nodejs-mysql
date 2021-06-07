const express = require('express')

const {
  getTodos,
  getTodo,
  getUserByTodo, 
  createTodo,
  updateTodo,
  updateCompletedTodo,
  deleteTodo} = require('../controllers/todo')

const router = express.Router()

router
  .route('/')
  .get(getTodos)
  .post(createTodo)

router
  .route('/:id')
  .get(getTodo)
  .put(updateTodo)
  .delete(deleteTodo)

  router.get('/:id/user', getUserByTodo)

  router.patch('/:id/completed', updateCompletedTodo)

module.exports = router