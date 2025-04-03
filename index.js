const express = require("express")
const app = express()
const port = 3000

const authRoute = require('./routes/authRoute')
const petFoodRoute = require('./routes/petFoodRoute')

app.use(express.json())
app.use('/', authRoute)
app.use('/petFood', petFoodRoute)

app.listen(port, async () => {
    console.log(`Connected`)
})
