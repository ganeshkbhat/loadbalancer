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
 * checkServerIdentity
 *
 * @param {*} host
 * @param {*} cert
 * @return {*} 
 * 
 */
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
 * echoServer
 *
 * @return {*} 
 * 
 */
function echoServer() {
    const pid = process.pid;
    return (req, res) => { res.end(`Handled by process ${pid}`); }
}


/**
 * 
 * serverStartCallback
 *
 * @param {*} host
 * @param {*} port
 * @return {*} 
 * 
 */
function serverStartCallback(host, port) {
    return () => { console.log('Started process at ' + host + " and port " + port); };
}


/**
 * 
 * server
 *
 * @param {*} serverOptions
 * @return {*} ServerInstance 
 * 
 * ServerInstance : typeof Server<Request extends typeof IncomingMessage = typeof IncomingMessage,  Response extends typeof ServerResponse = typeof ServerResponse>
 * 
 */
function server(serverOptions) {
    const fs = require("fs");
    const http = require(serverOptions?.protocol || 'http');

    serverOptions.port = serverOptions?.port || 8000;
    serverOptions.host = serverOptions?.host || "localhost";

    if (!serverOptions.callbacks) serverOptions.callbacks = {};

    serverOptions.callbacks.listen = (!!serverOptions.callbacks?.listen) ? serverOptions.callbacks.listen : serverStartCallback(serverOptions.host, serverOptions.port);
    if (!serverOptions?.server) serverOptions.server = serverOptions?.server || serverOptions?.callbacks?.server || echoServer();

    if (!serverOptions.server) throw new Error("Error: serverOptions.server - server or callback is not defined.");

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
 * socketBlocklist
 * 
 *
 */
function SocketBlocklist() {
    const net = require("net");
    const blockList = new net.BlockList();

    this.addAddress = (ipaddress, type) => {
        if (!!type) blockList.addAddress(ipaddress, type);
        blockList.addAddress(ipaddress);
    }

    this.addRange = (start, end, type) => {
        if (!!type) blockList.addRange(start, end, type);
        blockList.addRange(start, end);
    }

    this.addSubnet = (ipaddress, prefix, type) => {
        if (!!type) blockList.addSubnet(ipaddress, prefix, type);
        blockList.addSubnet(ipaddress, prefix);
    }

    this.check = (ipaddress, type) => {
        if (!!type) return blockList.check(ipaddress, type);
        return blockList.check(ipaddress);
    }

    this.rules = () => blockList.rules;

}


/**
 *
 * socketAddress
 *
 * @param {*} socketOptions
 * @return {*} 
 * 
 * Socket Address: 
 * https://nodejs.org/api/net.html#class-netsocketaddress
 * 
 */
function socketAddress(socketOptions) {
    const net = require("net");
    return new net.SocketAddress(socketOptions);
}


/**
 * SocketClass
 *
 */
function SocketClass(serverOptions) {

    this.serverOptions = {
        ...require("./server.json"),
        ...{
            "mainProcessCallback": () => { },
            "forkCallback": (opts, pr) => { },
            ...serverOptions
        }
    }

    SocketBlocklist.call(this, ...arguments);

    this.server = (s) => server(s || serverOptions);

    this.socketAddress = (s) => socketAddress(s);
    this.socketConnect = (s, c) => socketConnect(s || socketOptions, c);
    this.socketClient = (s) => socketClient(s || socketOptions);
    this.socketCreateConnection = (s, m) => socketCreateConnection(s || socketOptions, m);

    this.socketServer = (s) => socketServer(s);

    this.wssSocketServer = (s) => wssSocketServer(s);
    this.wsSocketServer = (s) => wsSocketServer(s);

    this.getDefaultAutoSelectFamily = () => getDefaultAutoSelectFamily();
    this.setDefaultAutoSelectFamily = (v) => setDefaultAutoSelectFamily(v);
    this.getDefaultAutoSelectFamilyAttemptTimeout = (v) => getDefaultAutoSelectFamilyAttemptTimeout(v);
    this.setDefaultAutoSelectFamilyAttemptTimeout = (v) => setDefaultAutoSelectFamilyAttemptTimeout(v);

    this.isIP = (i) => isIP(i);
    this.isIPv4 = (i) => isIPv4(i);
    this.isIPv6 = (i) => isIPv6(i);
}


/**
 * 
 * socketCreate
 *
 * @param {*} socketOptions
 * @return {*} SocketInstance
 * 
 * Socket APIs:
 * https://nodejs.org/api/net.html#class-netsocket
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
 * socketConnect
 *
 * @param {*} socketOptions
 * @param {*} socket
 * @return {*} SocketInstance
 * 
 * Socket APIs: 
 * https://nodejs.org/api/net.html#class-netsocket
 * 
 */
function socketConnect(socketOptions, socket) {

    // 
    // declare interface Socket {
    //   get readable(): ReadableStream;
    //   get writable(): WritableStream;
    //   get closed(): Promise<void>;
    //   close(): Promise<void>;
    //   startTls(): Socket;
    // }
    // declare interface SocketOptions {
    //   secureTransport?: string;
    //   allowHalfOpen: boolean;
    // }
    // declare interface SocketAddress {
    //   hostname: string;
    //   port: number;
    // }
    // 

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
 * socketCreateConnection
 *
 * @param {*} socketOptions
 * @param {string} [method="createConnection"]
 * @return {*} SocketInstance || ErrorInstance
 * 
 * Socket APIs: 
 * https://nodejs.org/api/net.html#netconnect 
 * https://nodejs.org/api/net.html#netcreateconnection
 * 
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
 * socketServerCreate
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
 * socketServerListen
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
 * socketServer
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
 * socketClient
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
 * websocket
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

    serverOptions = {
        ...require("./server.json"),
        ...{
            "mainProcessCallback": () => { },
            "forkCallback": (opts, pr) => { },
            ...serverOptions
        }
    }

    serverOptions.port = serverOptions?.port || 8000;
    serverOptions.host = serverOptions?.host || "localhost";

    serverOptions.server = (!!serverOptions?.server) ? serverOptions?.server : serverOptions?.callbacks?.server;
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
 * httpClient
 *
 * @param {*} serverOptions
 * @return {*} 
 * 
 */
function httpClient(serverOptions) {
    const https = require(protocol || 'https');

    function request(serverOptions) {
        const postData = JSON.stringify(data);

        var options = {
            hostname: serverOptions.host,
            port: serverOptions.port,
            path: serverOptions.url,
            method: serverOptions.method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length,
                ...serverOptions.headers
            },
            agent: serverOptions.agent || false,
            ...serverOptions
        };

        serverOptions = { ...options, ...serverOptions };
        if ((!!serverOptions.certs.keyPath && !!serverOptions.certs.certPath) && (!serverOptions.certs.key || !serverOptions.certs.cert)) {
            serverOptions = {
                certs: {
                    key: fs.readFileSync(serverOptions.keyPath),
                    cert: fs.readFileSync(serverOptions.certPath)
                },
                ...serverOptions
            };
        } else {
            throw new Error("Request Error: 'keyPath' and 'certPath' have to be specified OR 'key' and 'cert' have to be specified");
        }

        serverOptions.checkServerIdentity = checkServerIdentity;
        if (!!serverOptions.agent) { serverOptions.agent = new https.Agent(serverOptions); }

        return new Promise((resolve, reject) => {

            const req = https.request(url, serverOptions, (res) => {
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
 * httpSocketServer
 *
 * @param {*} serverOptions
 * @param {*} callback
 * @param {*} listencallback
 * @return {*} 
 * 
 */
function httpSocketServer(serverOptions) {
    serverOptions.protocol = "http";
    return server(serverOptions);
}


/**
 *
 * httpSocketClient
 *
 * @param {*} serverOptions
 * @return {Promise} 
 * 
 */
function httpSocketClient(serverOptions) {
    serverOptions.protocol = "http";
    return httpClient(serverOptions);
}


/**
 *
 * httpsSocketServer
 *
 * @param {*} serverOptions
 * @return {*} 
 * 
 */
function httpsSocketServer(serverOptions) {
    serverOptions.protocol = "https";
    return server(serverOptions);
}


/**
 *
 * httpsSocketClient
 * 
 * @param {*} serverOptions
 * @return {Promise} 
 * 
 */
function httpsSocketClient(serverOptions) {
    serverOptions.protocol = "https";
    // serverOptions.ws = true;
    return httpClient(serverOptions);
}


/**
 *
 * wsSocketServer
 *
 * @param {*} serverOptions
 * @return {*} 
 * 
 */
function wsSocketServer(serverOptions) {
    serverOptions.protocol = "http";
    serverOptions.ws = true;
    return websocket(serverOptions);
}


/**
 *
 * wsSendMessage
 *
 * @param {*} websocket
 * @param {*} data
 * 
 */
function wsSendMessage(websocket, data) {
    // // Construct a msg object containing the data the server needs to process the message from the chat client.
    // const msg = {
    //   type: "message",
    //   text: document.getElementById("text").value,
    //   id: clientID,
    //   date: Date.now(),
    // };
    websocket.send(JSON.stringify(data));
}


/**
 *
 * wsSocketClient
 *
 * @param {*} serverOptions
 * @return {*} 
 * 
 */
function wsSocketClient(serverOptions) {
    serverOptions.protocol = "http";
    serverOptions.ws = true;

    let webSocket = new WebSocket(serverOptions?.url, serverOptions?.protocols);
    // event.data : data sent by the event
    websocket.onopen = (event) => { serverOptions?.callbacks?.open(event); };
    // event.data : data sent by the event
    websocket.onmessage = (!serverOptions?.callbacks?.message) ? (event) => { serverOptions?.callbacks?.message(event); } : wsSendMessage(websocket, socketOptions.data);
    // CloseEvent.code : Read only : Returns an unsigned short containing the close code sent by the server.
    // CloseEvent.reason : Read only: Returns a string indicating the reason the server closed the connection. This is specific to the particular server and sub-protocol.
    // CloseEvent.wasClean : Read only: Returns a boolean value that Indicates whether or not the connection was cleanly closed.
    websocket.onclose = (event) => { serverOptions?.callbacks?.close(event); };
    return websocket;
}


/**
 *
 * wssSocketServer
 *
 * @param {*} serverOptions
 * @return {*} 
 * 
 */
function wssSocketServer(serverOptions) {
    serverOptions["protocol"] = "https";
    serverOptions.ws = true;
    return websocket(serverOptions);
}


/**
 *
 * wssSocketClient
 *
 * @param {*} serverOptions
 * @return {*} 
 * 
 */
function wssSocketClient(serverOptions) {
    serverOptions.protocol = "https";
    serverOptions.ws = true;
    return wsSocketClient(serverOptions);
}


/**
 *
 * WssSocketClient
 *
 * @param {*} serverOptions
 */
function WssSocketClient(serverOptions) {
    this.socketOptions = {
        ...require("./server.json"),
        ...{
            "mainProcessCallback": () => { },
            "forkCallback": (opts, pr) => { },
            ...serverOptions
        }
    };

    this.websocket = (this.socketOptions.protocol === "https") ? this.wssSocketClient(this.socketOptions) : this.wsSocketClient(this.socketOptions);
    this.wsSocketClient = (this.socketOptions.protocol === "https") ? () => { return wsSocketClient(this.socketOptions); } : () => { return wssSocketClient(this.socketOptions); };
    this.send = (data) => { return wsSendMessage(this.websocket, data); }
}


/**
 *
 * WssSocketServer
 *
 * @param {*} serverOptions
 */
function WssSocketServer(serverOptions) {
    WssSocketClient.call(this, serverOptions);

    this.socketOptions = {
        ...require("./server.json"),
        ...{
            "mainProcessCallback": () => { },
            "forkCallback": (opts, pr) => { },
            ...serverOptions
        }
    }

    this.wsSocketServer = (!!this.socketOptions.protocol === "https") ? () => { return wssSocketServer(this.socketOptions); } : () => { return wsSocketServer(this.socketOptions); };
    this.send = (data) => { return wsSendMessage(this.websocket, data); }
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


function getDefaultAutoSelectFamily() {
    const net = require("net");
    return net.getDefaultAutoSelectFamily();
}


function setDefaultAutoSelectFamily(value) {
    const net = require("net");
    return net.setDefaultAutoSelectFamily(value);
}


function getDefaultAutoSelectFamilyAttemptTimeout() {
    const net = require("net");
    return net.getDefaultAutoSelectFamilyAttemptTimeout();
}


function setDefaultAutoSelectFamilyAttemptTimeout(value) {
    const net = require("net");
    return net.setDefaultAutoSelectFamilyAttemptTimeout(value);
}


function isIP(input) {
    const net = require("net");
    return net.isIP(input);
}


function isIPv4(input) {
    const net = require("net");
    return net.isIPv4(input);
}


function isIPv6(input) {
    const net = require("net");
    return net.isIPv6(input);
}


module.exports.server = server;

module.exports.socketServerCreate = socketServerCreate;
module.exports.socketServerListen = socketServerListen;

module.exports.socketAddress = socketAddress;
module.exports.socketCreate = socketCreate;
module.exports.socketConnect = socketConnect;
module.exports.socketCreateConnection = socketCreateConnection;

module.exports.socketClient = socketClient;
module.exports.socketServer = socketServer;

module.exports.websocket = websocket;
module.exports.wsSocketServer = wsSocketServer;
module.exports.wsSocketClient = wsSocketClient;
module.exports.wssSocketServer = wssSocketServer;
module.exports.wssSocketClient = wssSocketClient;

module.exports.SocketClass = SocketClass;
module.exports.SocketBlocklist = SocketBlocklist;
module.exports.WssSocketServer = WssSocketServer;
module.exports.WssSocketClient = WssSocketClient;

module.exports.httpSocketServer = httpSocketServer;
module.exports.httpSocketClient = httpSocketClient;
module.exports.httpsSocketServer = httpsSocketServer;
module.exports.httpsSocketClient = httpsSocketClient;

module.exports.udpSocketServer = udpSocketServer;
module.exports.udpSocketClient = udpSocketClient;

module.exports.tcpSocketServer = tcpSocketServer;
module.exports.tcpSocketClient = tcpSocketClient;

module.exports.sshSocketServer = sshSocketServer;
module.exports.sshSocketClient = sshSocketClient;

module.exports.socketServer = socketServer;
module.exports.socketClient = socketClient;


module.exports.getDefaultAutoSelectFamily = getDefaultAutoSelectFamily;
module.exports.setDefaultAutoSelectFamily = setDefaultAutoSelectFamily;
module.exports.getDefaultAutoSelectFamilyAttemptTimeout = getDefaultAutoSelectFamilyAttemptTimeout;
module.exports.setDefaultAutoSelectFamilyAttemptTimeout = setDefaultAutoSelectFamilyAttemptTimeout;
module.exports.isIP = isIP;
module.exports.isIPv4 = isIPv4;
module.exports.isIPv6 = isIPv6;

