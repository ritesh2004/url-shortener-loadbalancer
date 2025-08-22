const { redisClient } = require('./redis.js')
require('dotenv').config('./.env');

const rateLimiter = async (req, res, next) => {
    const key = `rate_limit:${req.ip}`

    const numberOfRequests = await redisClient.get(key)
    console.log('Current number of requests:', numberOfRequests)
    if (!numberOfRequests) {
        redisClient.set(key, 1, 'EX', process.env.EXPIRATION_WINDOW)
    }
    else if (parseInt(numberOfRequests) < process.env.RATE_LIMIT) {
        redisClient.incr(key)
    }
    else {
        return res.status(429).send('Rate limit exceeded')
    }

    next()
}

module.exports = { rateLimiter }
