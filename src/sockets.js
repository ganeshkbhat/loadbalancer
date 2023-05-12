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


const checkServerIdentity = function (host, cert) {
    const tls = require('tls');
    const crypto = require('crypto');

    // https://nodejs.org/docs/latest-v20.x/api/https.html#httpsrequesturl-options-callback
    function sha256(s) {
        return crypto.createHash('sha256').update(s).digest('base64');
    }
    const err = tls.checkServerIdentity(host, cert);
    if (err) {
        return err;
    }

    // Pin the public key, similar to HPKP pin-sha256 pinning
    // change to your key 
    const pubkey256 = 'pL1+qb9HTMRZJmuC/bB/ZI9d302BYrrqiVuRyW+DGrU=';
    if (sha256(cert.pubkey) !== pubkey256) {
        const msg = 'Certificate verification error: ' +
            `The public key of '${cert.subject.CN}' ` +
            'does not match our pinned fingerprint';
        return new Error(msg);
    }

    // Pin the exact certificate, rather than the pub key
    // change to your cert 
    const cert256 = '25:FE:39:32:D9:63:8C:8A:FC:A1:9A:29:87:' +
        'D8:3E:4C:1D:98:DB:71:E4:1A:48:03:98:EA:22:6A:BD:8B:93:16';
    if (cert.fingerprint256 !== cert256) {
        const msg = 'Certificate verification error: ' +
            `The certificate of '${cert.subject.CN}' ` +
            'does not match our pinned fingerprint';
        return new Error(msg);
    }

    // // This loop is informational only.
    // // Print the certificate and public key fingerprints of all certs in the
    // // chain. Its common to pin the public key of the issuer on the public
    // // internet, while pinning the public key of the service in sensitive
    // // environments.
    // do {
    //     console.log('Subject Common Name:', cert.subject.CN);
    //     console.log('  Certificate SHA256 fingerprint:', cert.fingerprint256);

    //     hash = crypto.createHash('sha256');
    //     console.log('  Public key ping-sha256:', sha256(cert.pubkey));

    //     lastprint256 = cert.fingerprint256;
    //     cert = cert.issuerCertificate;
    // } while (cert.fingerprint256 !== lastprint256);
}


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
 * @return {*} ServerInstance 
 * 
 * ServerInstance : typeof Server<Request extends typeof IncomingMessage = typeof IncomingMessage,  Response extends typeof ServerResponse = typeof ServerResponse>
 */
function server(serverOptions) {
    const fs = require("fs");
    const http = require(serverOptions?.protocol || 'http');
    var callback;
    if (!callback) callback = echoServer();
    serverOptions.port = serverOptions?.port || 8000;
    serverOptions.host = serverOptions?.host || "localhost";

    if (!serverOptions.server) throw new Error("Error: serverOptions.server - server or callback is not defined.");
    if (!serverOptions.callbacks) serverOptions.callbacks = {};

    serverOptions.callbacks.listen = (!!serverOptions.callbacks?.listen) ? serverOptions.callbacks.listen : serverStartCallback(serverOptions.host, serverOptions.port);

    let srv = (!serverOptions?.protocol === "https") ?
        http.createServer(serverOptions?.server) : http.createServer({
            key: fs.readFileSync(serverOptions?.certs?.key || './certs/ssl.key'),
            cert: fs.readFileSync(serverOptions?.certs?.cert || './certs/ssl.cert')
        }, serverOptions?.server);
    srv.listen(serverOptions?.port, serverOptions?.host, serverOptions.callbacks.listen);
    return srv;
}


/**
 *
 *
 * @param {*} socketOptions
 * @return {*} SocketInstance
 * 
 */
function socketCreate(socketOptions) {
    const fs = require("fs");
    const net = require("net");
    const controller = new AbortController();

    socketOptions.options = {
        fd: null, allowHalfOpen: false,
        readable: false, writable: false,
        signal: controller.signal,
        ...socketOptions?.options
    };

    if (!socketOptions.callbacks) {
        throw new Error(`
            socketConnect: Callbacks not defined. 
                Please define the connectlistener and other event callbacks.
                Event callbacks - ready, connect, data, error, end, close, drain, timeout.
        `);
    }

    const socket = new net.Socket(socketOptions?.options);

    socket.on("connect", socketOptions?.callbacks?.connect);
    socket.on("data", socketOptions?.callbacks?.data);
    socket.on("drain", socketOptions?.callbacks?.drain);
    socket.on("end", socketOptions?.callbacks?.end);
    socket.on("error", socketOptions?.callbacks?.error);
    socket.on("lookup", socketOptions?.callbacks?.lookup);
    socket.on("ready", socketOptions?.callbacks?.ready);
    socket.on("timeout", socketOptions?.callbacks?.timeout);
    socket.on("close", socketOptions?.callbacks?.close);

    return { socket, controller };
}


/**
 *
 *
 * @param {*} socketOptions
 * @param {*} socket
 * @return {*} SocketInstance
 * 
 */
function socketConnect(socketOptions, socket) {

    socketOptions.options = {
        fd: null, allowHalfOpen: false,
        readable: false, writable: false,
        signal: null,
        ...socketOptions?.options
    }

    socketOptions["connectOptions"] = {
        port: null, host: 'localhost',
        localAddress: "", localPort: null,
        family: 0, hints: null,
        lookup: () => { }, noDelay: false,
        keepAlive: false, keepAliveInitialDelay: 0,
        autoSelectFamily: net.getDefaultAutoSelectFamily(),
        autoSelectFamilyAttemptTimeout: net.getDefaultAutoSelectFamilyAttemptTimeout(),
        ...socketOptions?.connectOptions
    }

    if (!socket) {
        let sc = socketCreate(socketOptions);
        socket = sc.socket;
        controller = sc.controller;
    }

    if (!socketOptions?.callbacks) {
        throw new Error(`
            socketConnect: Callbacks not defined. 
                Please define the connectlistener and other event callbacks.
                Event callbacks - ready, connect, data, error, end, close, drain, timeout.
        `);
    }

    if (!!socketOptions.connectOptions) {
        socket.connect(socketOptions?.connectOptions, socketOptions?.callbacks?.connectlistener);
    } else if (!!socketOptions?.host && !!socketOptions?.port) {
        socket.connect(socketOptions?.port, socketOptions?.host, socketOptions?.callbacks?.connectlistener);
    } else if (!!socketOptions.port && !socketOptions?.host) {
        socket.connect(socketOptions?.port, socketOptions?.callbacks?.connectlistener);
    }

    return { socket, controller };
}


/**
 *
 *
 * @param {*} socketOptions
 * @param {string} [method="createConnection"]
 * @return {*} SocketInstance || ErrorInstance
 */
function socketCreateConnection(socketOptions, method = "createConnection") {
    const net = require("net");

    socketOptions.options = {
        fd: null, allowHalfOpen: false, readable: false, writable: false,
        signal: null, port: null, host: 'localhost', localAddress: "", localPort: null,
        family: 0, hints: null, keepAlive: false, keepAliveInitialDelay: 0,
        noDelay: false, lookup: () => { },
        autoSelectFamily: net.getDefaultAutoSelectFamily(),
        autoSelectFamilyAttemptTimeout: net.getDefaultAutoSelectFamilyAttemptTimeout(),
        ...socketOptions?.options
    }

    let connect = (method === "connect") ? net.connect : net.createConnection;
    if (!!socketOptions?.options) {
        return connect(socketOptions?.options, socketOptions?.callbacks?.connectlistener);
    } else if (!!socketOptions.path && !!socketOptions.host) {
        return connect(socketOptions?.path, socketOptions?.host, socketOptions?.callbacks?.connectlistener);
    } else if (!!socketOptions?.path && !socketOptions?.host) {
        return connect(socketOptions?.path, socketOptions?.callbacks?.connectlistener);
    };

    throw new Error("socketCreateConnection: Required socket connection options are not provided");
}


/**
 *
 *
 * @param {*} socketOptions
 * @return {*} ServerInstance
 * 
 */
function socketServerCreate(socketOptions) {
    const fs = require("fs");
    const net = require("net");
    const controller = new AbortController();

    socketOptions.options = {
        allowHalfOpen: false, highWaterMark: stream.getDefaultHighWaterMark(),
        pauseOnConnect: false, noDelay: false,
        keepAlive: false, keepAliveInitialDelay: 0,
        signal: controller.signal,
        ...socketOptions?.options
    }

    var socketServer;
    if (!socketOptions?.options) {
        socketServer = new net.Server(socketOptions?.options, socketOptions?.callbacks.serverlistener);
    }

    socketServer.on("listening", socketOptions?.callbacks?.listening);
    socketServer.on("connection", socketOptions?.callbacks?.connection);
    socketServer.on("error", socketOptions?.callbacks?.error);
    socketServer.on("drop", socketOptions?.callbacks?.drop);
    socketServer.on("close", socketOptions?.callbacks?.close);

    return { socketServer, controller };
}


/**
 *
 *
 * @param {*} socketOptions
 * @param {*} socket
 * @return {*} ServerInstance
 * 
 */
function socketServerListen(socketOptions, socketServer) {
    let controller;
    socketOptions.options = {
        allowHalfOpen: false, highWaterMark: stream.getDefaultHighWaterMark(),
        pauseOnConnect: false, noDelay: false,
        keepAlive: false, keepAliveInitialDelay: 0,
        signal: controller.signal,
        ...socketOptions?.options
    }

    if (!socketServer) {
        let sc = socketServerCreate(socketOptions);
        socketServer = sc.socketServer;
        controller = sc.controller;
    }

    socketOptions.listenOptions = {
        port: null, host: null,
        path: null, backlog: 0,
        exclusive: false, readableAll: false,
        writableAll: false, ipv6Only: false,
        signal: controller.signal || null,
        ...socketOptions?.listenOptions
    }

    if (!socketOptions?.callbacks?.serverlistener) {
        throw new Error(`
            socketConnect: Callbacks not defined. 
                Please define the connectlistener and other event callbacks.
                Event callbacks - ready, connect, data, error, end, close, drain, timeout.
        `);
    }

    if (socketOptions?.listenOptions) {
        socketServer.listen(socketOptions?.listenOptions, socketOptions?.callbacks?.serverlistening);
    } else {
        if ((!!socketOptions?.port || !!socketOptions?.path || !!socketOptions?.handle) && !!socketOptions?.host && !!socketOptions?.backlog) {
            socketServer.listen(socketOptions?.port || socketOptions?.path || socketOptions?.handle, socketOptions?.host, socketOptions?.backlog, socketOptions?.callbacks?.serverlistening);
        } else if ((!!socketOptions?.port || !!socketOptions?.path || !!socketOptions?.handle) && !!socketOptions?.backlog) {
            socketServer.listen(socketOptions?.port || socketOptions?.path || socketOptions?.handle, socketOptions?.backlog, socketOptions?.callbacks?.serverlistening);
        } else if ((!!socketOptions?.port || !!socketOptions?.path || !!socketOptions?.handle) && !!socketOptions?.backlog) {
            socketServer.listen(socketOptions?.port || socketOptions?.path || socketOptions?.handle, socketOptions?.backlog, socketOptions?.callbacks?.serverlistening);
        } else if (!!socketOptions?.backlog) {
            socketServer.listen(socketOptions?.backlog, socketOptions?.callbacks?.serverlistening);
        } else {
            socketServer.listen({}, socketOptions?.callbacks?.serverlistening);
        }
    }

    return { socketServer, controller };
}


/**
 *
 *
 * @param {*} socketOptions
 * @return {*} ServerInstance
 * 
 */
function socketServer(socketOptions) {
    return socketServerListen(socketOptions);
}


/**
 *
 *
 * @param {*} socketOptions
 * @return {*} SocketInstance
 * 
 */
function socketClient(socketOptions) {
    const fs = require("fs");
    const net = require("net");
    return socketCreateConnection(socketOptions);
}


/**
 *
 *
 * @param {*} serverOptions
 * @return {*} ServerInstance
 * 
 *      ServerInstance : typeof Server<Request extends typeof IncomingMessage = typeof IncomingMessage,  Response extends typeof ServerResponse = typeof ServerResponse>
 */
function websocket(serverOptions) {
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
        "certs": {
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

    serverOptions.port = serverOptions?.port || 8000;
    serverOptions.host = serverOptions?.host || "localhost";

    serverOptions.server = (!!serverOptions?.server) ? serverOptions?.server : callback
    serverOptions.callbacks.listen = listencallback || serverStartCallback(serverOptions?.host, serverOptions?.port);
    serverOptions.callbacks.upgrade = () => { console.log("Upgrade Function Invoked"); }

    let srv;
    if (serverOptions?.protocol === "http") {
        srv = (!serverOptions?.server) ?
            http.createServer() : http.createServer(serverOptions?.server);
    } else if (serverOptions?.protocol === "https") {
        srv = (!serverOptions?.server) ?
            https.createServer({ key: fs.readFileSync(serverOptions?.certs?.key), cert: fs.readFileSync(serverOptions?.certs?.cert) }) :
            https.createServer({ key: fs.readFileSync(serverOptions?.certs?.key), cert: fs.readFileSync(serverOptions?.certs?.cert) }, serverOptions.server);
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


/**
 *
 *
 * @param {*} serverOptions
 * @return {*} 
 */
function httpClient(serverOptions) {
    const https = require(protocol || 'https');

    function request(serverOptions) {
        const postData = JSON.stringify(data);

        var options = {
            hostname: host,
            port: port,
            path: url,
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length,
                ...headers
            },
            agent: false
        };

        options = { ...options, ...serverOptions };
        if ((!!serverOptions.keyPath && !!serverOptions.certPath) && (!serverOptions.key || !serverOptions.cert)) {
            serverOptions = {
                ...serverOptions,
                key: fs.readFileSync(serverOptions.key),
                cert: fs.readFileSync(serverOptions.cert)
            };
        } else {
            throw new Error("Request Error: 'keyPath' and 'certPath' have to be specified OR 'key' and 'cert' have to be specified");
        }

        serverOptions.checkServerIdentity = checkServerIdentity;
        if (!!serverOptions.agent) { serverOptions.agent = new https.Agent(serverOptions); }

        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                if (res.statusCode < 200 || res.statusCode > 299) reject(new Error(`HTTP status code ${res.statusCode}`));
                const body = [];
                res.on('data', (chunk) => body.push(chunk));
                res.on('end', () => {
                    const resString = Buffer.concat(body).toString();
                    resolve(resString);
                });
            });

            req.on('error', (err) => { reject(err); });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request time out'));
            });
            if (["post", "put", "patch"].includes(method.toLowerCase())) { req.write(postData); }
            req.end();
        })
    }
    return request(serverOptions);
}


/**
 *
 *
 * @param {*} serverOptions
 * @param {*} callback
 * @param {*} listencallback
 * @return {*} 
 */
function httpSocketServer(serverOptions) {
    serverOptions.protocol = "http";
    return server(serverOptions);
}


/**
 *
 *
 * @param {*} serverOptions
 * @return {Promise} 
 */
function httpSocketClient(serverOptions) {
    serverOptions.protocol = "http";
    return httpClient(serverOptions);
}


/**
 *
 *
 * @param {*} serverOptions
 * @return {*} 
 */
function httpsSocketServer(serverOptions) {
    serverOptions.protocol = "https";
    return server(serverOptions);
}


/**
 *
 * @param {*} serverOptions
 * @return {Promise} 
 */
function httpsSocketClient(serverOptions) {
    serverOptions.protocol = "https";
    return httpClient(serverOptions);
}


/**
 *
 *
 * @param {*} serverOptions
 * @return {*} 
 */
function wsSocketServer(serverOptions) {
    serverOptions.protocol = "http";
    return websocket(serverOptions,);
}


/**
 *
 *
 * @param {*} serverOptions
 * @return {*} 
 */
function wsSocketClient(serverOptions) {
    return
}


/**
 *
 *
 * @param {*} serverOptions
 * @param {*} callbacks
 * @param {*} options
 * @return {*} 
 */
function wssSocketServer(serverOptions, callbacks, options) {
    serverOptions.protocol = "https";
    return websocket(serverOptions, callbacks, options);
}


function wssSocketClient(serverOptions) {

}


function tcpSocketServer(serverOptions) {

}


function tcpSocketClient(serverOptions) {

}


function udpSocketServer(serverOptions) {

}


function udpSocketClient(serverOptions) {

}


function sshSocketServer(serverOptions) {

}


function sshSocketClient(serverOptions) {

}


module.exports.server = server;

module.exports.socketServerCreate = socketServerCreate;
module.exports.socketServerListen = socketServerListen;

module.exports.socketCreate = socketCreate;
module.exports.socketConnect = socketConnect;
module.exports.socketCreateConnection = socketCreateConnection;

module.exports.socketClient = socketClient;
module.exports.socketServer = socketServer;

module.exports.httpSocketServer = httpSocketServer;
module.exports.httpSocketClient = httpSocketClient;
module.exports.httpsSocketServer = httpsSocketServer;
module.exports.httpsSocketClient = httpsSocketClient;


module.exports.websocket = websocket;
module.exports.wsSocketServer = wsSocketServer;
module.exports.wsSocketClient = wsSocketClient;
module.exports.wssSocketServer = wssSocketServer;
module.exports.wssSocketClient = wssSocketClient;

module.exports.udpSocketServer = udpSocketServer;
module.exports.udpSocketClient = udpSocketClient;

module.exports.tcpSocketServer = tcpSocketServer;
module.exports.tcpSocketClient = tcpSocketClient;

module.exports.sshSocketServer = sshSocketServer;
module.exports.sshSocketClient = sshSocketClient;

module.exports.socketServer = socketServer;
module.exports.socketClient = socketClient;

