const express = require('express')
const orderController = require('../controllers/orderController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()


router.get('/', authMiddleware, orderController.getOrder)
router.post('/', authMiddleware, orderController.addOrder)
router.put('/:id/cancel', authMiddleware, orderController.updateOrdertoCancel)
router.put('/:id/pay', authMiddleware, orderController.updateOrdertoPay)

module.exports = router