const express = require("express")
const router = express.Router()
const controller = require("../controllers/app")
const auth = require('../middleware/auth')

router.get('/', auth, controller.home)
router.post('/', auth, controller.api)

module.exports = router