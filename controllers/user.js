const { validate } = require('indicative/validator')
const { sanitize, sanitizations } = require('indicative/sanitizer')

const { connection } = require('../config/database')

exports.getUsers = (req, res) => {
  const { page, limit } = req.query

  connection.query('SELECT COUNT(*) FROM users', (error, results) => {
    if (error) {
      throw error
    }

    const count = results[0]['COUNT(*)']
    const limitAsNumber = Number(limit)
    const pageAsNumber = Number(page)
    const offset = Number((pageAsNumber - 1) * limit)

    connection.query('SELECT * FROM users LIMIT ?, ?', [offset, limitAsNumber], (error, results, _) => {
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


exports.getUser = (req, res) => {
  const { id } = req.params

  connection.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (error, results, _) => {
    if (error) {
      throw error
    }

    res.send(results[0])
  })
}

exports.getTodosByUser = (req, res) => {
  const { id } = req.params
  connection.query('select * from todos where id_user = ?', [id], (error, results, _) => {
    if(error){
      throw error
    }

    res.send(results);
  })
}

exports.createUser = (req, res) => {
  const data = req.body

  const rules = {
    name: 'required|min:6|max:20',
    email: 'required|email',
    status: 'boolean|in:active,inactive',
    gender: 'required|in:Masculino,Feminino',  
  }

  const sanitizationRules = {
    name: 'trim|escape|strip_tags',
    email: [
      sanitizations.normalizeEmail()
    ],
    email: 'escape|strip_tags',
    status: 'escape|strip_tags',
    gender: 'escape|strip_tags',
  }
  validate(data, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)

      connection.query('INSERT INTO users SET ?', [value], (error, results, _) => {
        if (error) {
          throw error
        }
    
        const { insertId } = results
    
        connection.query('SELECT * FROM users WHERE id = ? LIMIT 1', [insertId], (error, results, _) => {
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

exports.updateUser = (req, res) => {
  const { id } = req.params

  const data = req.body

  const rules = {
    name: 'required|min:6|max:20',
    email: 'required|email',
    status: 'in:active,inactive',
    gender: 'required|in:Masculino,Feminino',  
  }

  const sanitizationRules = {
    name: 'trim|escape|strip_tags',
    email: [
      sanitizations.normalizeEmail()
    ],
    email: 'escape|strip_tags',
    status: 'escape|strip_tags',
    gender: 'escape|strip_tags',
  }

  validate(data, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)
      
      connection.query('UPDATE users SET ? WHERE id = ?', [value, id], (error, results, _) => {
        if (error) {
          throw error
        }
    
        connection.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id], (error, results, _) => {
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

exports.setActiveStatusUser = (req, res) => {
  const { id } = req.params

  const { isActive } = req.body

  const rules = {
    isActive: 'in:active,inactive' 
  }

  const sanitizationRules = {
    isActive: 'escape|strip_tags',
  }

  validate(isActive, rules, sanitizationRules)
    .then((value) => {
      sanitize(value, sanitizationRules)
      
        let status
  
        if(isActive === 'active'){
          status = 'active'
        }else if(isActive === 'inactive'){
          status = 'inactive'
        }
      
        connection.query('UPDATE users SET status = ? WHERE id = ?', [status, id], (error, results, _) => {
          if (error) {
            throw error
          }
      
          res.send(isActive)
        })
    }).catch((error) => {
      res.status(400).send(error)
    })
}

exports.deleteUser = (req, res) => {
  const { id } = req.params

  connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results, _) => {
    if (error) {
      throw error
    }

    const [user] = results

    connection.query('DELETE FROM users WHERE id = ?', [id], (error, _, __) => {
      if (error) {
        throw error
      }

      res.send(user)
    })
  })
}