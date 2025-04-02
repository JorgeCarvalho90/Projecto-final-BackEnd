const express = require('express')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.createUser) 
router.post('/login', authController.loginUser)

module.exports = router