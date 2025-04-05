const db = require('../config/firebaseConfig')
const Joi = require("joi")

async function getOrder(req,res) {
    try{
        const getOrder = await db.collection("orders").where("id_user", "==", req.userId).get()
        const showOrder = getOrder.docs.map((doc)=>{
            return {id: doc.id, ...doc.data()}
        })
        return res.json(showOrder)
    }catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}

async function addOrder(req,res) {
    try{
        const validationJoi = addOrderValidation(req.body) //nao esta a entrar esta validacao, perguntar
        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }
        const getCart = await db.collection("cart").where("id_user", "==", req.userId).get()
        if (getCart.empty){
            return res.status(404).json("No cart found for your user")
        }

        const getCartDoc = getCart.docs[0]
        const getCartData = getCartDoc.data()

        const neworder ={
            id_user: req.userId,
            petFood: getCartData.petFood,
            shippingAddress: req.body.shippingAddress,
            status: "placed",
            timestamp: new Date().toISOString(),
            totalPrice: 0 //to do
        }
        console.log(getCartDoc.id)
        await db.collection("orders").add(neworder)
        await db.collection("cart").doc(getCartDoc.id).delete()
        return res.status(201).json("Order created and cart cleared")

    }catch(error){
        return res.status(400).json("Something went wrong, try again later");
    }
}

async function updateOrdertoCancel(req, res) {
    try{
        const { id } = req.params

        const doesItBelong = await checkIfOrderBelongs(req.userId, id)
        if (!doesItBelong){
            return res.status(403).json("Unauthorized")
        }

        const validationJoi = updateOrderValidationtoCancel(req.body)

        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }
        
        await db.collection("orders").doc(id).update({status : req.body.status})
        return res.json(`Order with ID ${id} cancelled`)

    }catch(error){
        return res.status(400).json("Something went wrong, try again later")
    }
}

async function updateOrdertoPay(req, res) {
    try{
        const { id } = req.params

        const doesItBelong = await checkIfOrderBelongs(req.userId, id)
        if (!doesItBelong){
            return res.status(403).json("Unauthorized")
        }

        const validationJoi = updateOrderValidationtoPay(req.body)

        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }

        await db.collection("orders").doc(id).update({status : req.body.status})
        return res.json(`Order with ID ${id} paid`) 

    }catch(error){
        return res.status(400).json("Something went wrong, try again later")
    }
}
//--------

async function checkIfOrderBelongs(id_user, id_data){
    try{
        const get = await db.collection("orders").doc(id_data).get()
        const data = get.data()

        if(data.id_user !== id_user){
          return false
        } else{
            return true
        }
      } catch(error){
        return "Order not found"
      }
 }

function addOrderValidation(values){
    const userSchema = Joi.object({
        shippingAddress: Joi.string().required()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}

function updateOrderValidationtoCancel(values){
    const userSchema = Joi.object({
        status: Joi.string().valid("cancelled").required()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}

function updateOrderValidationtoPay(values){
    const userSchema = Joi.object({
        status: Joi.string().valid("paid").required()
    }).strict().unknown(false)

    const { error } = userSchema.validate(values)
    if (error){
        return { error: error.message}
    } else{
        return { error: false}
    }
}
module.exports = {
    getOrder,
    addOrder,
    updateOrdertoCancel,
    updateOrdertoPay
}