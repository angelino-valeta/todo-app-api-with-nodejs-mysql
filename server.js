const express = require('express')
const bodyParser = require('body-parser')

const PORT = 3000


const userRoute = require('./routes/user-route')
const todoRoute = require('./routes/todo-route')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use('/users', userRoute)
app.use('/todos', todoRoute)

app.get('/welcome', (req, res)=> {

  const name = req.query

  res.send(`Welcome ${name} :`)

})

app.listen(PORT, () => {
  console.log('Todo app listening on port ', PORT)
})
