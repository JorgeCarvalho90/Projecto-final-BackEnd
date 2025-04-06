const db = require('../config/firebaseConfig')
const Joi = require("joi")
const { sendOrderConfirmation } = require('../config/mailer')

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
        const validationJoi = addOrderValidation(req.body)
        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }

        const getCart = await db.collection("cart").where("id_user", "==", req.userId).get()
        if (getCart.empty){
            return res.status(404).json("No cart found for your user")
        }

        if (req.body === undefined){
            return res.status(400).json("Body cannot be empty. Please send valid data to proceed.")
        }

        const getCartDoc = getCart.docs[0]
        const getCartData = getCartDoc.data()
        const petFoodItems = getCartData.petFood

        let totalPrice = 0
        const updatedStocks = []

        for (const item of petFoodItems){
            const petFood = db.collection("petfood").doc(item.petFoodId)
            const getPetFood = await petFood.get()

            const getPetFoodData = getPetFood.data()

            if (getPetFoodData.stock < item.quantity) {
                return res.status(400).json(`Not enough stock for ${getPetFoodData.name}. Please cancel this order and make a new one`)
            }

            totalPrice += item.quantity * getPetFoodData.price
            console.log (totalPrice)

            updatedStocks.push({
                petFood,
                newStock: getPetFoodData.stock - item.quantity
            })

            for (const item of updatedStocks) {
                await item.petFood.update({ stock: item.newStock })
            }

        }
        const neworder ={
            id_user: req.userId,
            petFood: getCartData.petFood,
            shippingAddress: req.body.shippingAddress,
            status: "placed",
            timestamp: new Date().toISOString(),
            totalPrice
        }
        await db.collection("orders").add(neworder)
        // await db.collection("cart").doc(getCartDoc.id).delete()

        // await sendOrderConfirmation(req.userEmail, {
        //     shippingAddress: req.body.shippingAddress,
        //     totalPrice,
        //     status: "placed",
        //     petFood: await Promise.all(petFoodItems.map(async item => {
        //       const petFoodSnap = await db.collection("petfood").doc(item.petFoodId).get()
        //       const petFoodData = petFoodSnap.data()
        //       return {
        //         name: petFoodData.name,
        //         quantity: item.quantity,
        //         price: petFoodData.price
        //       }
        //     }))
        // });
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

        if (req.body === undefined){
            return res.status(400).json("Body cannot be empty. Please send valid data to proceed.")
        }

        const checkStatus = await db.collection("orders").doc(id).get()
        const checkStatusData = checkStatus.data()

        if(checkStatusData === undefined){
            return res.status(404).json(`Order with ID ${id} not found`)
        }

        if(checkStatusData.status !== "placed"){
            return res.status(400).json(`Order with ID ${id} is already with status ${checkStatusData.status} and can't be cancelled`)
        }
        const validationJoi = updateOrderValidationtoCancel(req.body)

        if (validationJoi.error) {
            return res.status(400).json(validationJoi.error)
        }
        
        // await db.collection("orders").doc(id).update({status : req.body.status})
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

        if (req.body === undefined){
            return res.status(400).json("Body cannot be empty. Please send valid data to proceed.")
        }

        const checkStatus = await db.collection("orders").doc(id).get()
        const checkStatusData = checkStatus.data()

        if(checkStatusData === undefined){
            return res.status(404).json(`Order with ID ${id} not found`)
        }

        if(checkStatusData.status !== "placed"){
            return res.status(400).json(`Order with ID ${id} is already with status ${checkStatusData.status} and can't be paid`)
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