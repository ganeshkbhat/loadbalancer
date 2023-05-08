/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: index.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const { loadbalancer, threadingMultiple, threading } = require("./src/loadbalancer");
const { server, reverseProxy, websocket_secure, websocket, createNetProxy, sqlKvStore } = require("./src/serverutils");


module.exports.loadbalancer = { loadbalancer, threadingMultiple, threading };
module.exports.serverutils = { server, reverseProxy, websocket_secure, websocket, createNetProxy, sqlKvStore };

module.exports.default = {
    loadbalancer, threadingMultiple, threading,
    server, reverseProxy, websocket_secure, websocket, createNetProxy, sqlKvStore
}
