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

const { loadbalancer, threadingMultiple, threading, clustering, processing, processingMultiple } = require("./src/loadbalancer");
const { reverseProxy, createNetProxy, httpProxy, sqlKvStore } = require("./src/serverutils");
const {
    poolsInstance, sortPoolsByKeys, sortPoolsByKey, closeConnections,
    randomize, sequential, sticky, weighted, singleMaxload,
    Randomize, Sequential, Sticky, Weighted, SingleMaxload
} = require("./src/algorithms");
const {
    echoServer, checkServerIdentity, serverStartCallback,
    server, websocket, socketServer, socketClient,
    socketServerCreate, socketServerListen, socketCreate, socketConnect, socketCreateConnection,
    socketAddress, httpSocketServer, httpSocketClient, httpsSocketServer, httpsSocketClient,
    wsSocketServer, wsSocketClient, wssSocketServer, wssSocketClient,
    tcpSocketServer, tcpSocketClient, udpSocketServer, udpSocketClient,
    sshSocketServer, sshSocketClient,
    SocketBlocklist, WssSocketServer, WssSocketClient, SocketClass,

    getDefaultAutoSelectFamily, setDefaultAutoSelectFamily, getDefaultAutoSelectFamilyAttemptTimeout,
    setDefaultAutoSelectFamilyAttemptTimeout, isIP, isIPv4, isIPv6
} = require("./src/sockets");
const { generateCertificates } = require("./src/certificates");


module.exports.loadbalancer = loadbalancer;
module.exports.threadingMultiple = threadingMultiple;
module.exports.threading = threading;
module.exports.clustering = clustering;
module.exports.processing = processing;
module.exports.processingMultiple = processingMultiple;
module.exports.serverutils = { reverseProxy, createNetProxy, httpProxy, sqlKvStore };

module.exports.algorithms = {
    poolsInstance, sortPoolsByKeys, sortPoolsByKey, closeConnections,
    randomize, sequential, sticky, weighted, singleMaxload,
    Randomize, Sequential, Sticky, Weighted, SingleMaxload
};

module.exports.sockets = {
    echoServer, checkServerIdentity, serverStartCallback,
    server, websocket, socketServer, socketClient,
    socketServerCreate, socketServerListen, socketCreate, socketConnect, socketCreateConnection,
    socketAddress, httpSocketServer, httpSocketClient, httpsSocketServer, httpsSocketClient,
    wsSocketServer, wsSocketClient, wssSocketServer, wssSocketClient,
    tcpSocketServer, tcpSocketClient, udpSocketServer, udpSocketClient,
    sshSocketServer, sshSocketClient,
    SocketBlocklist, WssSocketServer, WssSocketClient, SocketClass,


    getDefaultAutoSelectFamily, setDefaultAutoSelectFamily, getDefaultAutoSelectFamilyAttemptTimeout,
    setDefaultAutoSelectFamilyAttemptTimeout, isIP, isIPv4, isIPv6
};


module.exports.certificates = { generateCertificates };

module.exports.default = {
    server, reverseProxy, createNetProxy, sqlKvStore,

    loadbalancer, threadingMultiple, threading,

    poolsInstance, sortPoolsByKeys, sortPoolsByKey, closeConnections,
    randomize, sequential, sticky, weighted, singleMaxload,
    Randomize, Sequential, Sticky, Weighted, SingleMaxload,

    echoServer, checkServerIdentity, serverStartCallback,
    server, websocket, socketServer, socketClient,
    socketServerCreate, socketServerListen, socketCreate, socketConnect, socketCreateConnection,
    socketAddress, httpSocketServer, httpSocketClient, httpsSocketServer, httpsSocketClient,
    wsSocketServer, wsSocketClient, wssSocketServer, wssSocketClient,
    tcpSocketServer, tcpSocketClient, udpSocketServer, udpSocketClient,
    sshSocketServer, sshSocketClient,
    SocketBlocklist, WssSocketServer, WssSocketClient, SocketClass,
    httpProxy,

    getDefaultAutoSelectFamily, setDefaultAutoSelectFamily, getDefaultAutoSelectFamilyAttemptTimeout,
    setDefaultAutoSelectFamilyAttemptTimeout, isIP, isIPv4, isIPv6,

    generateCertificates
}

