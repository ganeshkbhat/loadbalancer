


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
