const db = require('../config/firebaseConfig')
const Joi = require("joi")

async function addCart(req,res) {
    try{
        const getCart = await db.collection("cart").where("id_user", "==", req.userId).get()
        const showcart = getCart.docs.map((doc) => doc.id)
        if (showcart.length > 0){
            return res.status(400).json(`You already have a cart ongoing, please update it. ID: ${JSON.stringify(showcart)}`)
        }

        if (!req.body || Object.keys(req.body).length === 0){
            return res.status(400).json("Body cannot be empty. Please send valid data to proceed.")
        }

        const validationJoi = addCartValidation(req.body)
        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }

        for (const item of req.body.petFood){
            const getPetFood = await db.collection("petfood").doc(item.petFoodId).get()

            if(!getPetFood.exists){
                return res.status(404).json(`Pet food with ID ${item.petFoodId} not found`)
            }

            const getPetFoodData = getPetFood.data()
            if(item.quantity > getPetFoodData.stock){
                return res.status(400).json(`Insufficient stock for ${item.petFoodId}. Only ${getPetFoodData.stock} available`)
            }
        }

        const newCart ={
            id_user: req.userId,
            ...req.body
        }
        await db.collection("cart").add(newCart)
        return res.status(201).json("Foods added to cart")

    }catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}

async function getCart(req,res) {
    try{
        const getCart = await db.collection("cart").where("id_user", "==", req.userId).get()
        const showcart = getCart.docs.map((doc)=>{
            return {id: doc.id, ...doc.data()}
        })
        return res.json(showcart)
    }catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}
async function updateCart(req, res) {
    try{
        const { id } = req.params

        const doesItBelong = await checkIfCartBelongs(req.userId, id)
        if (!doesItBelong){
            return res.status(403).json("Unauthorized")
        }

        if (!req.body || Object.keys(req.body).length === 0){
            return res.status(400).json("Body cannot be empty. Please send valid data to proceed.")
        }
        
        const validationJoi = updateCartValidation(req.body)
        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }

        for (const item of req.body.petFood){
            const getPetFood = await db.collection("petfood").doc(item.petFoodId).get()

            if(!getPetFood.exists){
                return res.status(404).json(`Pet food with ID ${item.petFoodId} not found`)
            }

            const getPetFoodData = getPetFood.data()
            if(item.quantity > getPetFoodData.stock){
                return res.status(400).json(`Insufficient stock for ${item.petFoodId}. Only ${getPetFoodData.stock} available`)
            }
        }
    
        const updatedCart = {
            ...req.body,
            lastUpdated : new Date().toISOString()
        }
        await db.collection("cart").doc(id).update(updatedCart)

        return res.json(`Cart with ID ${id} updated`)

    }catch(error){
        return res.status(400).json("Cart not found")
    }
}
async function deleteCart(req, res) {
    try{
        const { id } = req.params

        const doesItBelong = await checkIfCartBelongs(req.userId, id)

        if (!doesItBelong){
            return res.status(403).json("Unauthorized")
        }

        await db.collection("cart").doc(id).delete()
        return res.json(`Cart with ID ${id} deleted`)
    } catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}
//------------------------------------------

function addCartValidation(values){
    const userSchema = Joi.object({
        petFood: Joi.array().items(
            Joi.object({
                petFoodId: Joi.string().required(),
                quantity: Joi.number().integer().min(1).required()
            })
        ).required()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}

function updateCartValidation(values){
    const userSchema = Joi.object({
        petFood: Joi.array().items(
            Joi.object({
                petFoodId: Joi.string(),
                quantity: Joi.number().integer().min(1)
            })
        ).required()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}

async function checkIfCartBelongs(id_user, id_data){
    try{
        const get = await db.collection("cart").doc(id_data).get()
        const data = get.data()

        if(data.id_user !== id_user){
          return false
        } else{
            return true
        }
      } catch(error){
        return "Cart not found"
      }
 }

module.exports = {
    addCart,
    getCart,
    updateCart,
    deleteCart
}