/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: sockets.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

/**
 *
 *
 * @return {*} 
 */
function echoServer() {
    const pid = process.pid;
    return (req, res) => { res.end(`Handled by process ${pid}`); }
}


/**
 *
 *
 * @param {*} host
 * @param {*} port
 * @return {*} 
 */
function serverStartCallback(host, port) {
    return () => { console.log('Started process at ' + host + " and port " + port); };
}


/**
 *
 *
 * @param {*} serverOptions
 * @param {string} [callback=(req, res) => { res.end(`Handled by process ${pid}`); }]
 * @param {string} [listencallback=() => { console.log('Started process ' + port); }]
 * @return {*} 
 */
function server(serverOptions, callback, listencallback) {
    const fs = require("fs");
    const http = require(serverOptions?.protocol || 'http');

    callback = callback || echoServer();
    serverOptions?.port = serverOptions?.port || 8000;
    serverOptions?.host = serverOptions?.host || "localhost";

    serverOptions?.server = (!!serverOptions?.server) ? serverOptions?.server : callback;
    serverOptions.callbacks.listen = listencallback || serverStartCallback(serverOptions?.host, serverOptions?.port);

    let srv = (!serverOptions?.protocol === "https") ?
        http.createServer(serverOptions?.server) : http.createServer({
            key: fs.readFileSync(serverOptions?.keys?.key || './certs/ssl.key'),
            cert: fs.readFileSync(serverOptions?.keys?.cert || './certs/ssl.cert')
        }, serverOptions?.server);

    srv.listen(serverOptions?.port, serverOptions?.host, serverOptions.callbacks.listen);
    return srv;
}


function udpSocketServer() {

}


function udpSocketClient() {

}


/**
 *
 *
 * @param {*} serverOptions
 * @param {string} [callbacks={ "upgrade": () => { console.log("Upgrade Function Invoked"); } }]
 * @param {*} [options={}]
 * @return {*} 
 */
function websocket(serverOptions, callbacks = { "upgrade": () => { console.log("Upgrade Function Invoked"); } }, options = {}) {
    const fs = require('fs');
    const http = require('http');
    const https = require('https');
    const crypto = require('crypto');

    serverOptions = serverOptions || {
        "server": null,
        "protocol": "http",
        "createCerts": true,
        "host": "localhost",
        "proxy": {
            "proxy": true,
            "protocol": "http",
            "host": "localhost",
            "port": 7000,
            "proxyHost": "",
            "proxyPort": 9000
        },
        "keys": {
            "key": "./certs/ssl.key",
            "cert": "./certs/ssl.cert"
        },
        "port": 8000,
        "ws": true,
        "processes": 5,
        "threads": 10,
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        }
    }

    serverOptions?.port = serverOptions?.port || 8000;
    serverOptions?.host = serverOptions?.host || "localhost";

    serverOptions?.server = (!!serverOptions?.server) ? serverOptions?.server : callback
    serverOptions.callbacks.listen = listencallback || serverStartCallback(serverOptions?.host, serverOptions?.port);

    let srv;
    if (serverOptions?.protocol === "http") {
        srv = (!serverOptions?.server) ?
            http.createServer() : http.createServer(serverOptions?.server);
    } else if (serverOptions?.protocol === "https") {
        srv = (!serverOptions?.server) ?
            https.createServer({ key: fs.readFileSync(serverOptions?.keys?.key), cert: fs.readFileSync(serverOptions?.keys?.cert) }) :
            https.createServer({ key: fs.readFileSync(serverOptions?.keys?.key), cert: fs.readFileSync(serverOptions?.keys?.cert) }, serverOptions.server);
    }

    const connections = new Set();

    if (!callbacks) {
        if (!callbacks["data"]) {
            callbacks["data"] = (data) => {
                // Parse the message
                const isFinal = (data[0] & 0x80) !== 0;
                const opcode = data[0] & 0x0f;
                const hasMask = (data[1] & 0x80) !== 0;
                let payloadLength = data[1] & 0x7f;
                let maskingKey = null;
                let payloadStart = 2;

                if (payloadLength === 126) {
                    payloadLength = data.readUInt16BE(2);
                    payloadStart = 4;
                } else if (payloadLength === 127) {
                    payloadLength = data.readUInt32BE(2) * 2 ** 32 + data.readUInt32BE(6);
                    payloadStart = 10;
                }

                if (hasMask) {
                    maskingKey = data.slice(payloadStart, payloadStart + 4);
                    payloadStart += 4;
                }

                const payload = data.slice(payloadStart, payloadStart + payloadLength);

                if (hasMask) {
                    for (let i = 0; i < payload.length; i++) {
                        payload[i] ^= maskingKey[i % 4];
                    }
                }

                if (opcode === 0x08) {
                    // If the client sends a close frame, close the connection
                    connection.end();
                    connections.delete(connection);
                } else {
                    // Otherwise, send the message to all other clients
                    for (const other of connections) {
                        if (other !== connection) {
                            other.write(data);
                        }
                    }
                }
            }
        }

        if (!callbacks["end"]) {
            callbacks["end"] = () => {
                connections.delete(connection);
            }
        }

        if (!callbacks["upgrade"]) {
            callbacks["upgrade"] = (req, socket, head) => {
                if (req.headers['upgrade'] !== 'websocket') {
                    // Verify that the request is a valid WebSocket request
                    socket.end('HTTP/1.1 400 Bad Request');
                    return;
                }

                // Generate a random WebSocket key
                const key = req.headers['sec-websocket-key'];
                const hash = crypto.createHash('sha1');
                hash.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
                const acceptKey = hash.digest('base64');

                // Send the response headers to the client
                const headers = options?.headers || [
                    'HTTP/1.1 101 Switching Protocols',
                    'Upgrade: websocket',
                    'Connection: Upgrade',
                    `Sec-WebSocket-Accept: ${acceptKey}`
                ];
                socket.write(headers.join('\r\n') + '\r\n\r\n');

                // Add the connection to the set of active connections
                const connection = socket;
                connections.add(connection);

                // Handle incoming messages
                connection.on('data', callbacks["data"]);

                // Handle the connection closing
                connection.on('end', callbacks["end"]);
            }
        }

        if (!callbacks["listen"]) {
            callbacks["listen"] = serverStartCallback(serverOptions?.host, serverOptions?.port);
        }
    }

    srv.on('upgrade', callbacks["upgrade"] || function () { console.log("Test") });
    srv.listen(serverOptions?.port, serverOptions?.host, callbacks["listen"]);
    return srv;
}


// /**
//  *
//  *
//  * @param {*} serverOptions
//  * @param {string} [callbacks={ "upgrade": () => { console.log("Upgrade Function Invoked"); } }]
//  * @param {*} [options={}]
//  * @return {*} 
//  */
// function websocket_secure(serverOptions, callbacks = { "upgrade": () => { console.log("Upgrade Function Invoked"); } }, options = {}) {
//     const fs = require('fs');
//     const https = require('https');
//     const crypto = require('crypto');
//
//     serverOptions = serverOptions || {
//         "server": null,
//         "protocol": "http",
//         "createCerts": true,
//         "host": "localhost",
//         "proxy": {
//             "proxy": true,
//             "protocol": "http",
//             "host": "localhost",
//             "port": 7000
//         },
//         "keys": {
//             "key": "./certs/ssl.key",
//             "cert": "./certs/ssl.cert"
//         },
//         "port": 8000,
//         "ws": true,
//         "processes": 5,
//         "threads": 10,
//         "mainProcessCallback": () => { },
//         "forkCallback": (opts, pr) => { },
//         "callbacks": {
//             "server": null,
//             "listen": null
//         }
//     }
//
//     const srv = (!serverOptions.server) ? https.createServer({
//         key: fs.readFileSync(serverOptions?.keys?.key),
//         cert: fs.readFileSync(serverOptions?.keys?.cert)
//     }) : https.createServer({
//         key: fs.readFileSync(serverOptions?.keys?.key),
//         cert: fs.readFileSync(serverOptions?.keys?.cert)
//     }, serverOptions.server);
//
//     const connections = new Set();
//
//     if (!callbacks) {
//         if (!callbacks["data"]) {
//             callbacks["data"] = (data) => {
//                 // Parse the message
//                 const isFinal = (data[0] & 0x80) !== 0;
//                 const opcode = data[0] & 0x0f;
//                 const hasMask = (data[1] & 0x80) !== 0;
//                 let payloadLength = data[1] & 0x7f;
//                 let maskingKey = null;
//                 let payloadStart = 2;
//
//                 if (payloadLength === 126) {
//                     payloadLength = data.readUInt16BE(2);
//                     payloadStart = 4;
//                 } else if (payloadLength === 127) {
//                     payloadLength = data.readUInt32BE(2) * 2 ** 32 + data.readUInt32BE(6);
//                     payloadStart = 10;
//                 }
//
//                 if (hasMask) {
//                     maskingKey = data.slice(payloadStart, payloadStart + 4);
//                     payloadStart += 4;
//                 }
//
//                 const payload = data.slice(payloadStart, payloadStart + payloadLength);
//
//                 if (hasMask) {
//                     for (let i = 0; i < payload.length; i++) {
//                         payload[i] ^= maskingKey[i % 4];
//                     }
//                 }
//
//                 if (opcode === 0x08) {
//                     // If the client sends a close frame, close the connection
//                     connection.end();
//                     connections.delete(connection);
//                 } else {
//                     // Otherwise, send the message to all other clients
//                     for (const other of connections) {
//                         if (other !== connection) {
//                             other.write(data);
//                         }
//                     }
//                 }
//             }
//         }
//
//         if (!callbacks["end"]) {
//             callbacks["end"] = () => {
//                 connections.delete(connection);
//             }
//         }
//
//         if (!callbacks["upgrade"]) {
//             callbacks["upgrade"] = (req, socket, head) => {
//                 // Verify that the request is a valid WebSocket request
//                 if (req.headers['upgrade'] !== 'websocket') {
//                     socket.end('HTTP/1.1 400 Bad Request');
//                     return;
//                 }
//
//                 // Generate a random WebSocket key
//                 const key = req.headers['sec-websocket-key'];
//                 const hash = crypto.createHash('sha1');
//                 hash.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
//                 const acceptKey = hash.digest('base64');
//
//                 // Send the response headers to the client
//                 const headers = options?.headers || [
//                     'HTTP/1.1 101 Switching Protocols',
//                     'Upgrade: websocket',
//                     'Connection: Upgrade',
//                     `Sec-WebSocket-Accept: ${acceptKey}`
//                 ];
//                 socket.write(headers.join('\r\n') + '\r\n\r\n');
//
//                 // Add the connection to the set of active connections
//                 const connection = socket;
//                 connections.add(connection);
//
//                 // Handle incoming messages
//                 connection.on('data', callbacks["data"]);
//
//                 // Handle the connection closing
//                 connection.on('end', callbacks["end"]);
//             }
//         }
//
//         if (!callbacks["listen"]) {
//             callbacks["listen"] = () => { console.log('Listening on http://localhost:8080'); }
//         }
//     }
//
//     srv.on('upgrade', callbacks["upgrade"]);
//     srv.listen(serverOptions?.port, serverOptions?.host, callbacks["listen"]);
//     return srv;
// }


// /**
//  *
//  *
//  * @param {*} serverOptions
//  * @param {*} [callbacks={}]
//  * @param {*} [options={}]
//  * @return {*} 
//  */
// function websocket(serverOptions, callbacks = {}, options = {}) {
//
//     const fs = require('fs');
//     const https = require('https');
//     const http = require('http');
//     const crypto = require('crypto');
//
//     serverOptions = serverOptions || {
//         "server": null,
//         "protocol": "http",
//         "createCerts": true,
//         "host": "localhost",
//         "proxy": {
//             "proxy": true,
//             "protocol": "http",
//             "host": "localhost",
//             "port": 7000
//         },
//         "keys": {
//             "key": "./certs/ssl.key",
//             "cert": "./certs/ssl.cert"
//         },
//         "port": 8000,
//         "ws": true,
//         "processes": 5,
//         "threads": 10,
//         "mainProcessCallback": () => { },
//         "forkCallback": (opts, pr) => { },
//         "callbacks": {
//             "server": null,
//             "listen": null
//         }
//     }
//
//     const srv = (!serverOptions?.server) ? http.createServer() : http.createServer(serverOptions?.server);
//     const connections = new Set();
//
//     if (!callbacks) {
//         if (!callbacks["data"]) {
//             callbacks["data"] = (data) => {
//                 // Parse the message
//                 const isFinal = (data[0] & 0x80) !== 0;
//                 const opcode = data[0] & 0x0f;
//                 const hasMask = (data[1] & 0x80) !== 0;
//                 let payloadLength = data[1] & 0x7f;
//                 let maskingKey = null;
//                 let payloadStart = 2;
//
//                 if (payloadLength === 126) {
//                     payloadLength = data.readUInt16BE(2);
//                     payloadStart = 4;
//                 } else if (payloadLength === 127) {
//                     payloadLength = data.readUInt32BE(2) * 2 ** 32 + data.readUInt32BE(6);
//                     payloadStart = 10;
//                 }
//
//                 if (hasMask) {
//                     maskingKey = data.slice(payloadStart, payloadStart + 4);
//                     payloadStart += 4;
//                 }
//
//                 const payload = data.slice(payloadStart, payloadStart + payloadLength);
//
//                 if (hasMask) {
//                     for (let i = 0; i < payload.length; i++) {
//                         payload[i] ^= maskingKey[i % 4];
//                     }
//                 }
//
//                 if (opcode === 0x08) {
//                     // If the client sends a close frame, close the connection
//                     connection.end();
//                     connections.delete(connection);
//                 } else {
//                     // Otherwise, send the message to all other clients
//                     for (const other of connections) {
//                         if (other !== connection) {
//                             other.write(data);
//                         }
//                     }
//                 }
//             }
//         }
//
//         if (!callbacks["end"]) {
//             callbacks["end"] = () => {
//                 connections.delete(connection);
//             }
//         }
//
//         if (!callbacks["upgrade"]) {
//             callbacks["upgrade"] = (req, socket, head) => {
//                 // Verify that the request is a valid WebSocket request
//                 if (req.headers['upgrade'] !== 'websocket') {
//                     socket.end('HTTP/1.1 400 Bad Request');
//                     return;
//                 }
//
//                 // Generate a random WebSocket key
//                 const key = req.headers['sec-websocket-key'];
//                 const hash = crypto.createHash('sha1');
//                 hash.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
//                 const acceptKey = hash.digest('base64');
//
//                 // Send the response headers to the client
//                 const headers = options?.headers || [
//                     'HTTP/1.1 101 Switching Protocols',
//                     'Upgrade: websocket',
//                     'Connection: Upgrade',
//                     `Sec-WebSocket-Accept: ${acceptKey}`
//                 ];
//                 socket.write(headers.join('\r\n') + '\r\n\r\n');
//
//                 // Add the connection to the set of active connections
//                 const connection = socket;
//                 connections.add(connection);
//
//                 // Handle incoming messages
//                 connection.on('data', callbacks["data"]);
//
//                 // Handle the connection closing
//                 connection.on('end', callbacks["end"]);
//             }
//         }
//
//         if (!callbacks["listen"]) {
//             callbacks["listen"] = () => { console.log(`Listening on ${serverOptions?.host} and on port ${serverOptions?.port}`); }
//         }
//     }
//
//     srv.on('upgrade', callbacks["upgrade"] || function () { console.log("Test") });
//     srv.listen(serverOptions?.port, serverOptions?.host, callbacks["listen"]);
//     return srv;
// }


function httpSocketServer(serverOptions, callback, listencallback) {
    serverOptions?.protocol = "http";
    return server(serverOptions, callback, listencallback);
}


function httpSocketClient() {

}


function httpsSocketServer() {
    serverOptions?.protocol = "https";
    return server(serverOptions, callback, listencallback);
}


function httpsSocketClient() {

}


function wsSocketServer() {
    serverOptions?.protocol = "http";
    return server(serverOptions, callback, listencallback);
}


function wsSocketClient() {

}


function wssSocketServer() {
    serverOptions?.protocol = "https";
    return server(serverOptions, callback, listencallback);
}


function wssSocketClient() {

}


function tcpSocketServer() {

}


function tcpSocketClient() {

}


function sshSocketServer() {

}


function sshSocketClient() {

}


function socketServer() {

}


function socketClient() {

}


module.exports.server = server;
module.exports.websocket = websocket;

module.exports.udpSocketServer = udpSocketServer;
module.exports.udpSocketClient = udpSocketClient;

module.exports.httpSocketServer = httpSocketServer;
module.exports.httpSocketClient = httpSocketClient;
module.exports.httpsSocketServer = httpsSocketServer;
module.exports.httpsSocketClient = httpsSocketClient;

module.exports.wsSocketServer = wsSocketServer;
module.exports.wsSocketClient = wsSocketClient;
module.exports.wssSocketServer = wssSocketServer;
module.exports.wssSocketClient = wssSocketClient;

module.exports.tcpSocketServer = tcpSocketServer;
module.exports.tcpSocketClient = tcpSocketClient;

module.exports.sshSocketServer = sshSocketServer;
module.exports.sshSocketClient = sshSocketClient;

module.exports.socketServer = socketServer;
module.exports.socketClient = socketClient;

