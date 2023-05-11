/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: serverutils.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';


const {
    echoServer, checkServerIdentity, serverStartCallback,
    server, websocket, socketServer, socketClient,
    httpSocketServer, httpSocketClient, httpsSocketServer, httpsSocketClient,
    wsSocketServer, wsSocketClient, wssSocketServer, wssSocketClient,
    tcpSocketServer, tcpSocketClient, udpSocketServer, udpSocketClient,
    sshSocketServer, sshSocketClient
} = require("./sockets");


/**
 *
 *
 * @param {*} serverOptions
 * @param {string} [callback=(req, res) => { res.end(`Handled by process ${pid}`); }]
 * @param {string} [listencallback=() => { console.log('Started process ' + port); }]
 * @return {*} 
 */
function serverProxy(serverOptions) {
    const fs = require("fs");
    const http = require(serverOptions?.protocol || 'http');

    var callback = function (req, res) {
        const options = {
            hostname: serverOptions?.proxy?.host,
            port: serverOptions?.proxy?.port,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        const proxyReq = https.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        req.pipe(proxyReq);

        proxyReq.on('error', (err) => {
            console.error(err);
            res.statusCode = 502;
            res.end('Bad gateway');
        });
    }

    var listencallback = (!serverOptions.callbacks.listen) ? serverOptions.callbacks.listen : serverStartCallback();

    const pid = process.pid;
    let srv = (!serverOptions?.protocol === "https") ? http.createServer(callback) : http.createServer({
        key: fs.readFileSync(serverOptions?.certs?.key || './certs/ssl.key'),
        cert: fs.readFileSync(serverOptions?.certs?.cert || './certs/ssl.cert')
    }, (!!serverOptions?.server) ? serverOptions?.server : callback);

    srv.listen(serverOptions?.port, serverOptions?.host, listencallback.bind(this, serverOptions?.host, serverOptions?.port));
    return srv;
}


/**
 *
 *
 * @param {*} serverOptions
 */
function reverseProxy(serverOptions) {
    const { proxy, host, port, protocol } = serverOptions?.proxy;
    const http = require(protocol || 'http');
    const pid = process.pid;

    if (!!serverOptions?.callbacks) {
        if (!serverOptions?.callbacks?.server) {
            serverOptions.callbacks.server = (req, res) => {
                const options = {
                    hostname: serverOptions?.proxy?.host,
                    port: serverOptions?.proxy?.port,
                    path: req.url,
                    method: req.method,
                    headers: req.headers
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers);
                    proxyRes.pipe(res);
                });

                req.pipe(proxyReq);

                proxyReq.on('error', (err) => {
                    console.error(err);
                    res.statusCode = 502;
                    res.end('Bad gateway');
                });
            }
        }

        if (!serverOptions?.callbacks?.listen) {
            serverOptions.callbacks.listen = serverOptions?.callbacks?.listen || serverStartCallback();
        }
    }

    let srv;
    if (protocol === "https") {
        srv = http.createServer({
            key: fs.readFileSync(serverOptions?.certs?.key || './certs/ssl.key'),
            cert: fs.readFileSync(serverOptions?.certs?.cert || './certs/ssl.cert')
        }, serverOptions?.callbacks?.server);
    } else {
        srv = http.createServer(serverOptions?.callbacks?.server);
    }
    srv.listen(serverOptions?.port, serverOptions?.host, serverOptions?.callbacks?.listen.bind(this, serverOptions?.host, serverOptions?.port));
    return srv;
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
function createNetProxy(serverOptions) {
    const net = require('net');
    const url = require('url');
    hostname = serverOptions?.host;
    port = serverOptions?.port; // || process.env.PORT || 9191;
    const http = require(!!serverOptions?.protocol || (!!serverOptions?.certs?.cert && !!serverOptions?.certs?.key) ? "https" : "http");

    const requestHandler = (req, res) => {
        // discard all request to proxy server except HTTP/1.1 CONNECT method
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method not allowed');
    }

    let server;
    if (serverOptions?.protocol === "https") {
        server = (!serverOptions?.server) ?
            https.createServer({ key: fs.readFileSync(serverOptions?.certs?.key), cert: fs.readFileSync(serverOptions?.certs?.cert) }) :
            https.createServer({ key: fs.readFileSync(serverOptions?.certs?.key), cert: fs.readFileSync(serverOptions?.certs?.cert) }, serverOptions.server);
    } else {
        server = http.createServer(requestHandler);
    }

    const listener = server.listen(port, hostname, (err) => {
        if (err) return console.error(err);
        const info = listener.address();
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
    });
}


/**
 *
 *
 * @param {*} filepath
 * @param {*} tablename
 */
function sqlKvStore(filepath, tablename) {

}


/**
 *
 *
 * @param {*} cluster
 * @param {*} proc
 * @param {*} algorithm
 */
function clusterMasterCallback(cluster, proc, algorithm) {

    var algorithms = require("./algorithms");

    function algorithmCallback(alg, data) {
        const uuid = require("uuid");
        let messageId = uuid.uuidv5();
        let results;
        if (alg === "all") {
            Object.values(cluster.workers).forEach(worker => {
                worker.send({
                    data: data,
                    message: `Cluster Worker Messaging: ${worker.id}: ${messageId}`
                });
            });
        } else if (alg === "randomize") {

        } else if (alg === "sequential") {

        } else if (alg === "weighted") {

        } else if (alg === "sticky") {

        } else if (alg === "singlemaxload") {

        }
        return results;
    }

    function sendMessage(alg, data) {
        algorithmCallback(alg, { test: "testing data from master" })
    }

    function listenMessage() {
        cluster.on("message", function (worker) {
            worker.on("message", (data) => {
                console.log(`Cluster Child to Master Messaging: ${data}`);
            });
        });
    }

}


/**
 *
 *
 * @param {*} cluster
 * @param {*} proc
 */
function clusterChildCallback(cluster, proc) {

    function sendMessage(data) {
        process.send(data)
    }

    function listenMessage(data) {

    }

}


module.exports.serverProxy = serverProxy;
module.exports.reverseProxy = reverseProxy;
module.exports.createNetProxy = createNetProxy;
module.exports.sqlKvStore = sqlKvStore;

module.exports.clusterMasterCallback = clusterMasterCallback;
module.exports.clusterChildCallback = clusterChildCallback;
