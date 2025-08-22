const { redisClient } = require('./redis.js');
const httpProxy = require('http-proxy')
require('dotenv').config('./.env');

const SERVER1 = process.env.SERVER1;
const SERVER2 = process.env.SERVER2;
const SERVER3 = process.env.SERVER3;

const servers = [SERVER1, SERVER2, SERVER3];

const loadBalancer = (req, res, next) => {
    // Implement round-robin load balancing
    const server = servers.shift();
    servers.push(server);

    // Validate server URL
    console.log('Forwarding request to:', server);
    try {
        new URL(server);
    } catch (err) {
        res.statusCode = 500;
        res.end('Error: Must provide a proper URL as target');
        return;
    }

    // Forward the request to the selected server
    const proxy = httpProxy.createProxyServer({});
    proxy.web(req, res, { target: server }, (err) => {
        console.error('Error proxying request:', err);
        res.status(502).send('Bad Gateway');
    });

    // save number of connections in each server in redis database
    if (redisClient.get(`server:${server}:connections`)) {
        redisClient.incr(`server:${server}:connections`);
    } else {
        redisClient.set(`server:${server}:connections`, 1);
    }

    // decrement the number of connections when the request is complete
    proxy.on('proxyRes', (proxyRes, req, res) => {
        redisClient.decr(`server:${server}:connections`);
    });
}

module.exports = { loadBalancer };