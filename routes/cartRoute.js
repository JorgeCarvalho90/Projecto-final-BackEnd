const express = require('express')
const cartController = require('../controllers/cartController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, cartController.addCart)
router.get('/', authMiddleware, cartController.getCart)
router.put('/:id', authMiddleware, cartController.updateCart)
router.delete('/:id', authMiddleware, cartController.deleteCart)

module.exports = router