const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const { rateLimiter } = require('./rate_limiter.js')
const { loadBalancer } = require('./load_balancer.js')
 
dotenv.config('./.env')

const app = express()
app.use(cors())
app.use(helmet())
app.use(rateLimiter)
app.use(loadBalancer)
app.use(express.json())


const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
