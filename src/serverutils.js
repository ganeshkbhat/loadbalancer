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


/**
 *
 *
 * @param {*} serverOptions
 * @param {string} [callback=(req, res) => { res.end(`Handled by process ${pid}`); }]
 * @param {string} [listencallback=() => { console.log('Started process ' + port); }]
 * @return {*} 
 */
function server(serverOptions, callback = (req, res) => { res.end(`Handled by process ${pid}`); }, listencallback = () => { console.log('Started process ' + port); }) {
    const http = require(serverOptions?.protocol || 'http');
    const pid = process.pid;
    let server = (!serverOptions?.protocol === "https") ? http.createServer(callback) : https.createServer({
        key: fs.readFileSync(key.key || '../certs/ssl.key'),
        cert: fs.readFileSync(key.cert || '../certs/ssl.cert')
    }, callback);

    server.listen(serverOptions?.port || 8080, serverOptions?.host || "localhost", listencallback.bind(this, port));
    return server;
}


/**
 *
 *
 * @param {*} serverOptions
 */
function proxy(serverOptions, callbacks) {
    const { targetHost, targetPort, port, protocol } = serverOptions;
    const http = require(protocol || 'http');
    const pid = process.pid;

    // const targetHost = 'example.com'; // the host you want to proxy
    // const targetPort = 80; // the port of the target host

    if (!callback) {
        if (!callback["server"]) {
            callback["server"] = (req, res) => {
                const proxyReq = http.request({
                    hostname: targetHost,
                    port: targetPort,
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                }, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    proxyRes.pipe(res);
                });
                req.pipe(proxyReq);
            }
        }

        if (!callback["listen"]) {
            callback["listen"] = () => { console.log('Proxy server listening on port 8080'); }
        }
    }

    const server = http.createServer(callback["server"]);
    server.listen(port, callback["listen"]);
    return server;
}


/**
 *
 * 
 * @param {*} protocol
 * @param {*} hostname
 * @param {*} port
 * @param {*} certs
 * 
 * Credit: https://stackoverflow.com/a/32104777/3204942
 * 
 */
function createProxy(protocol, hostname, port, certs) {
    const net = require('net');
    const url = require('url');
    hostname = hostname || "127.0.0.1";
    port = port || process.env.PORT || 9191;
    const http = require(protocol || (!!certs?.cert && !!certs?.key) ? "https" : "http");

    const requestHandler = (req, res) => { // discard all request to proxy server except HTTP/1.1 CONNECT method
        res.writeHead(405, { 'Content-Type': 'text/plain' })
        res.end('Method not allowed')
    }

    let server;
    if (protocol === "https") {
        server = http.createServer(requestHandler);
    } else {
        server = http.createServer(requestHandler);
    }

    const listener = server.listen(port, hostname, (err) => {
        if (err) {
            return console.error(err)
        }
        const info = listener.address()
        console.log(`Server is listening on address ${info.address} port ${info.port}`)
    });

    server.on('connect', (req, clientSocket, head) => { // listen only for HTTP/1.1 CONNECT method
        console.log(clientSocket.remoteAddress, clientSocket.remotePort, req.method, req.url)
        if (!req.headers['proxy-authorization']) { // here you can add check for any username/password, I just check that this header must exist!
            clientSocket.write([
                'HTTP/1.1 407 Proxy Authentication Required',
                'Proxy-Authenticate: Basic realm="proxy"',
                'Proxy-Connection: close',
            ].join('\r\n'))
            clientSocket.end('\r\n\r\n')  // empty body
            return
        }
        const { port, hostname } = url.parse(`//${req.url}`, false, true) // extract destination host and port from CONNECT request
        if (hostname && port) {
            const serverErrorHandler = (err) => {
                console.error(err.message)
                if (clientSocket) {
                    clientSocket.end(`HTTP/1.1 500 ${err.message}\r\n`)
                }
            }
            const serverEndHandler = () => {
                if (clientSocket) {
                    clientSocket.end(`HTTP/1.1 500 External Server End\r\n`)
                }
            }
            const serverSocket = net.connect(port, hostname) // connect to destination host and port
            const clientErrorHandler = (err) => {
                console.error(err.message)
                if (serverSocket) {
                    serverSocket.end()
                }
            }
            const clientEndHandler = () => {
                if (serverSocket) {
                    serverSocket.end()
                }
            }
            clientSocket.on('error', clientErrorHandler)
            clientSocket.on('end', clientEndHandler)
            serverSocket.on('error', serverErrorHandler)
            serverSocket.on('end', serverEndHandler)
            serverSocket.on('connect', () => {
                clientSocket.write([
                    'HTTP/1.1 200 Connection Established',
                    'Proxy-agent: Node-VPN',
                ].join('\r\n'))
                clientSocket.write('\r\n\r\n') // empty body
                // "blindly" (for performance) pipe client socket and destination socket between each other
                serverSocket.pipe(clientSocket, { end: false })
                clientSocket.pipe(serverSocket, { end: false })
            })
        } else {
            clientSocket.end('HTTP/1.1 400 Bad Request\r\n')
            clientSocket.destroy()
        }
    })
}


function websocket_secure(server, port, keys, callbacks, options) {
    const fs = require('fs');
    const https = require('https');
    const crypto = require('crypto');

    const server = https.createServer({
        key: fs.readFileSync(key.key || '../certs/ssl.key'),
        cert: fs.readFileSync(key.cert || '../certs/ssl.cert')
    });

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
                // Verify that the request is a valid WebSocket request
                if (req.headers['upgrade'] !== 'websocket') {
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
            callbacks["listen"] = () => { console.log('Listening on http://localhost:8080'); }
        }
    }

    server.on('upgrade', callbacks["upgrade"]);
    server.listen(port, callbacks["listen"]);
    return server;
}


function websocket(server, port, callbacks, options) {
    const http = require('http');
    const crypto = require('crypto');

    const server = http.createServer();
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
                // Verify that the request is a valid WebSocket request
                if (req.headers['upgrade'] !== 'websocket') {
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
            callbacks["listen"] = () => { console.log('Listening on http://localhost:8080'); }
        }
    }

    server.on('upgrade', callbacks["upgrade"]);
    server.listen(port, callbacks["listen"]);
    return server;
}


function sqlKvStore() {

}

module.exports.server = server;
module.exports.proxy = proxy;
module.exports.websocket_secure = websocket_secure;
module.exports.websocket = websocket;
module.exports.createProxy = createProxy;
module.exports.sqlKvStore = sqlKvStore;

