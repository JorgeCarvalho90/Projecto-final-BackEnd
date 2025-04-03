const express = require('express')
const petFoodController = require('../controllers/petFoodController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/', authMiddleware, petFoodController.addPetFood)
router.get('/', petFoodController.getAllPetFoods)
router.put('/:id', authMiddleware, petFoodController.updatePetFood)
router.delete('/:id', authMiddleware, petFoodController.deletePetFood)

module.exports = router