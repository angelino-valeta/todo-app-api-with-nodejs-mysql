const express = require('express')
const {
  getUsers, 
  getUser,
  getTodosByUser, 
  createUser,
  updateUser, 
  setActiveStatusUser, 
  deleteUser} = require('../controllers/user')


const router = express.Router()

router
  .route('/')
  .get(getUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

router.get('/:id/todos',getTodosByUser)

router.patch('/:id/activated', setActiveStatusUser)


module.exports = router