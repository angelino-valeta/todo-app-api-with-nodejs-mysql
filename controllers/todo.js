
const { validate } = require('indicative/validator')
const { sanitize, sanitizations } = require('indicative/sanitizer')

const { connection } = require('../config/database')

exports.getTodos = (req, res) => {
  const { page, limit } = req.query

  connection.query('SELECT COUNT(*) FROM todos', (error, results) => {
    if (error) {
      throw error
    }

    const count = results[0]['COUNT(*)']
    const limitAsNumber = Number(limit)
    const pageAsNumber = Number(page)
    const offset = Number((pageAsNumber - 1) * limit)

    connection.query('SELECT * FROM todos LIMIT ?, ?', [offset, limitAsNumber], (error, results, _) => {
      if (error) {
        throw error
      }

      const pages = Math.ceil(count / limit)

      res.send({
        code: 200,
        meta: {
          pagination: {
            total: count,
            pages: pages,
            page: pageAsNumber,
          }
        },
        data: results,
      })
    })
  })
}

exports.getTodo = (req, res) => {
  const { id } = req.params

  connection.query('SELECT * FROM todos WHERE id = ? LIMIT 1', [id], (error, results, _) => {
    if (error) {
      throw error
    }

    res.send(results[0])
  })
}

exports.getUserByTodo = (req, res) => {
  const { id } = req.params
  connection.query('SELECT u.id, u.name, u.email, u.status, u.gender, u.created_at, u.updated_at from todos t join users u on (t.id_user = u.id) WHERE t.id = ?', [id], (error, results, _) => {
    if(error){
      throw error
    }
    res.send(results);
  })
}

exports.createTodo = (req, res) => {
  const data = req.body

  const rules = {
    task: 'required|string',
    completed: 'required',
    id_user: 'required|integer'
  }

  const sanitizationRules = {
    task: 'trim|escape|strip_tags',
    completed: 'escape|strip_tags',
  }

  validate(data, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)
      
      connection.query('INSERT INTO todos SET ?', [value], (error, results, _) => {
        if (error) {
          throw error
        }
    
        const { insertId } = results
    
        connection.query('SELECT * FROM todos WHERE id = ? LIMIT 1', [insertId], (error, results, _) => {
          if (error) {
            throw error
          }
    
          res.send(results[0])
        })
      })
    }).catch((error) => {
      res.status(400).send(error)
    })
}

exports.updateTodo = (req, res) => {
  const { id } = req.params

  const data = req.body

  const rules = {
    task: 'string',
    completed: 'boolean'
  }

  const sanitizationRules = {
    task: 'trim|escape|strip_tags',
    completed: 'escape|strip_tags',
    
  }

  validate(data, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)
      
      connection.query('UPDATE todos SET ? WHERE id = ?', [value, id], (error, results, _) => {
        if (error) {
          throw error
        }
    
        connection.query('SELECT * FROM todos WHERE id = ? LIMIT 1', [id], (error, results, _) => {
          if (error) {
            throw error
          }
    
          res.send(results[0])
        })
      })
    }).catch((error) => {
      res.status(400).send(error)
  })
}

exports.updateCompletedTodo = (req, res) => {
  const { id } = req.params

  const { completed } = req.body

  const rules = {
    completed: 'boolean', 
  }

  const sanitizationRules = {
    completed: 'escape|strip_tags',
  }

  validate(completed, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)

      const isCompleted = completed === "true" ? "true" : "false"
  
      connection.query('UPDATE todos SET completed = ? WHERE id = ?', [isCompleted, id], (error, results, _) => {
        if (error) {
          throw error
        }
    
        res.send(completed)
      })
    }).catch((error) => {
      res.status(400).send(error)
    })
}

exports.deleteTodo = (req, res) => {
  const { id } = req.params

  connection.query('SELECT * FROM todos WHERE id = ?', [id], (error, results, _) => {
    if (error) {
      throw error
    }

    const [todo] = results

    connection.query('DELETE FROM todos WHERE id = ?', [id], (error, _, __) => {
      if (error) {
        throw error
      }
      res.send(todo)
    })
  })
}