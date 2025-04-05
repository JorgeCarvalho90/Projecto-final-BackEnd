const express = require("express")
const app = express()
const port = 3000

const authRoute = require('./routes/authRoute')
const petFoodRoute = require('./routes/petFoodRoute')
const cartRoute = require('./routes/cartRoute')
const orderRoute = require('./routes/orderRoute')

app.use(express.json())
app.use('/', authRoute)
app.use('/petFood', petFoodRoute)
app.use('/cart', cartRoute)
app.use('/orders', orderRoute)

app.listen(port, async () => {
    console.log(`Connected`)
})
