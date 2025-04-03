const db = require('../config/firebaseConfig')
const Joi = require("joi")

async function addPetFood(req,res) {
    try{
        if (req.userRole !== "admin"){
            return res.status(403).json("Only admins can add new food")
        }

        const validationJoi = addPetFoodValidation(req.body)
        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }

        const validation2 = await checkIfPetFoodNameAlreadyExists(req.body.name)
        if(validation2){
            return res.status(400).send("Product with the same name already added")
        }

        await db.collection("petfood").add(req.body)
        return res.status(201).json("New food added")

    }catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}

async function getAllPetFoods(req,res) {
    const getAllFoods = await db.collection("petfood").get()
    const showAllFoods = getAllFoods.docs.map((doc)=>{
        return {id: doc.id, ...doc.data()}
    })
    return res.status(200).json(showAllFoods)
}

async function updatePetFood(req, res) {
    try{
        if (req.userRole !== "admin"){
            return res.status(403).json("Only admins can add new food")
        }

        const validationJoi = updatePetFoodValidation(req.body)

        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }

        const { id } = req.params

        await db.collection("petfood").doc(id).update(req.body)

        return res.json(`Pet food with ID ${id} updated`)
    }catch(error){
        return res.status(400).json("Pet food not found")
    }
}

async function deletePetFood(req, res) {
    try{
        if (req.userRole !== "admin"){
            return res.status(403).json("Only admins can delete food")
        }
        const { id } = req.params
        await db.collection("petfood").doc(id).delete()
        return res.json(`Pet food with ID ${id} deleted`)
    } catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}
//--------------------------------------------------------------------



function addPetFoodValidation(values){
    const userSchema = Joi.object({
        animal: Joi.string().valid("dog", "cat").required(),
        type: Joi.string().valid("wet", "dry").required(),
        brand: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        stock: Joi.number().positive().allow(0).integer().required()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}


function updatePetFoodValidation(values){
    const userSchema = Joi.object({
        animal: Joi.string().valid("dog", "cat"),
        type: Joi.string().valid("wet", "dry"),
        brand: Joi.string(),
        name: Joi.string(),
        price: Joi.number().positive(),
        stock: Joi.number().positive().allow(0).integer()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}
async function checkIfPetFoodNameAlreadyExists(name) {
    const checkIfPetFoodNameAlreadyExists = await db.collection("petfood").where("name", "==", name).get()
    if(checkIfPetFoodNameAlreadyExists.docs[0]){
        return true
    }else{
        return false
    }
}


module.exports = {
    addPetFood,
    getAllPetFoods,
    updatePetFood,
    deletePetFood
}