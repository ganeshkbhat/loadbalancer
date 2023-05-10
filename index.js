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
const {
    poolsInstance, sortPoolsByKeys, sortPoolsByKey, closeConnections,
    randomize, sequential, sticky, weighted, singleMaxload,
    Randomize, Sequential, Sticky, Weighted, SingleMaxload
} = require("./src/algorithms");
const { 
    udpSocketServer, udpSocketClient, httpSocketServer, httpSocketClient, 
    httpsSocketServer, httpsSocketClient, wsSocketServer, wsSocketClient, 
    wssSocketServer, wssSocketClient, tcpSocketServer, tcpSocketClient, 
    sshSocketServer, sshSocketClient, socketServer, socketClient
} = require("./src/sockets");

const { generateCertificates } = require("./src/certificates");


module.exports.loadbalancer = { loadbalancer, threadingMultiple, threading };
module.exports.serverutils = { server, reverseProxy, websocket_secure, websocket, createNetProxy, sqlKvStore };
module.exports.algorithms = { 
    poolsInstance, sortPoolsByKeys, sortPoolsByKey, closeConnections, 
    randomize, sequential, sticky, weighted, singleMaxload, 
    Randomize, Sequential, Sticky, Weighted, SingleMaxload 
};
module.exports.sockets = { 
    udpSocketServer, udpSocketClient, httpSocketServer, httpSocketClient, 
    httpsSocketServer, httpsSocketClient, wsSocketServer, wsSocketClient, 
    wssSocketServer, wssSocketClient, tcpSocketServer, tcpSocketClient, 
    sshSocketServer, sshSocketClient, socketServer, socketClient
};
module.exports.certificates = { generateCertificates };

module.exports.default = {
    loadbalancer, threadingMultiple, threading,
    server, reverseProxy, websocket_secure, websocket, createNetProxy, sqlKvStore,
    poolsInstance, sortPoolsByKeys, sortPoolsByKey, closeConnections,
    randomize, sequential, sticky, weighted, singleMaxload,
    Randomize, Sequential, Sticky, Weighted, SingleMaxload,
    generateCertificates
}


