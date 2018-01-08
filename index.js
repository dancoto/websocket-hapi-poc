'use strict';
process.title = 'websocket-poc';

const PORT = 1337;
const Boom = require('boom');
const Hapi = require('hapi');
const HapiWebSocket = require('hapi-plugin-websocket');
const HapiAuthBasic = require('hapi-auth-basic');
const Inert = require('inert');
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: PORT
});
// Register plugins
server.register(HapiWebSocket);
server.register(HapiAuthBasic);
server.register(Inert);

// Set basic auth
server.auth.strategy('simple', 'basic', {
    validateFunc: (req, username, password, callback) => {
        if(username === 'foo' && password === 'bar') {
            callback(null, true, {username: username});
        } else {
            callback(Boom.unauthorized('Invalid username/password'), false);
        }
    }
});
server.auth.default('simple');

/* Plain REST route */
server.route({
    method: "POST",
    path: '/rest',
    config: {
        payload: {
            output: 'data',
            parse: true,
            allow: 'application/json'
        }
    },
    handler: (req, res) => {
        res({
            at: 'foo',
            seen: req.payload
        });
    }
});

/* Websocket Route */
server.route({
    method: "POST", path: "/ws",
    config: {
        plugins: { websocket: { only: true, autoping: 30 * 1000 } }
    },
    handler: (req, res) => {
        res({ at: "ws", seen: req.payload })
    }
});

server.route({
    method: 'GET',
    path: '/',
    handler: {
        file: 'index.html'
    }
})

server.start();