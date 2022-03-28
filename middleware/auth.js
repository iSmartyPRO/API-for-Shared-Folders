const authLogger = require('../helpers/logger-auth')

const {api} = require('../config')
module.exports = (req, res, next) => {
  // Проверка существования токена
  if(req.headers['i-token'] && req.headers['i-token'].length != 22) {
    authLogger.error(`API Key length is ${req.headers['i-token'].length} - should equal 22`)
    return res.status(500).json({message:'Auth failed'})
  }
  let auth = null
  api.forEach(item => {
    if(item.token) {
      auth = item
    }
  })
  if(auth.token === req.headers['i-token']) {
    if(req.headers['user']) {
      req.apiName = auth.name
      authLogger.info(`API: ${auth.name}, by user: ${req.headers['user']}, request: ${JSON.stringify(req.body)}`)
      next()
    } else {
      authLogger.error(`API: ${auth.name} - Missing user details in headers`)
      res.status(404).json({message: 'Missing user details in headers'})
    }

  } else {
    authLogger.error(`Auth failed`)
    res.status(401).json({message: 'Auth failed'})
  }



  for(let i = 0; i < api.length; i++) {
    if(api[i].token  && res.req.headers['user']) {


    } else {

    }
  }
}