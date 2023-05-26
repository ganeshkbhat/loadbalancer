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


const { EventEmitter } = require("stream");
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
    };

    var listencallback = (!serverOptions?.callbacks?.listen) ? serverOptions?.callbacks?.listen : serverStartCallback();

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
                req = {
                    path: req.url,
                    method: req.method,
                    headers: req.headers,
                    ...req,
                    hostname: serverOptions?.proxy?.host,
                    port: serverOptions?.proxy?.port
                };

                // const proxyReq = https.request(options, (proxyRes) => {
                //     res.writeHead(proxyRes.statusCode, proxyRes.headers);
                //     proxyRes.pipe(res);
                // });

                const proxyReq = https.request(req, (proxyRes) => {
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
 * @param {*} serverOptions
 * @return {*} 
 * 
 * Main server port (via loadbalancer) => proxyHost port => proxy port
 * 
 */
function httpProxy(serverOptions) {
    var http = require('http'), httpProxy = require('http-proxy');
    var proxy = httpProxy.createProxyServer({}).listen(serverOptions.port, serverOptions.host, serverOptions.callbacks.proxyListen);

    const EE = new EventEmitter();
    EE.addListener("closeProxy", function (e) {
        proxy.close();
    }.bind(null, serverOptions, proxy, EE))

    /** https://www.npmjs.com/package/http-proxy#setup-a-stand-alone-proxy-server-with-proxy-request-header-re-writing */
    /** https://www.npmjs.com/package/http-proxy#listening-for-proxy-events */
    proxy.on('error', serverOptions?.callbacks?.proxyError.bind(null, serverOptions, proxy, EE) || function (err, req, res) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end({ ...err, message: 'Something went wrong. And we are reporting a custom error message.' });
    }.bind(null, serverOptions, proxy, EE));

    proxy.on('proxyReq', serverOptions?.callbacks?.proxyInterceptorRequest.bind(null, serverOptions, proxy, EE) || function (proxyReq, req, res, options) { }.bind(null, serverOptions, proxy, EE));
    proxy.on('proxyReqWs', serverOptions?.callbacks?.proxyInterceptorRequestWS.bind(null, serverOptions, proxy, EE) || function (proxyReqWs, req, res, options) { }.bind(null, serverOptions, proxy, EE));
    proxy.on('proxyRes', serverOptions?.callbacks?.proxyInterceptorResponse.bind(null, serverOptions, proxy, EE) || function (proxyRes, req, res, options) { }.bind(null, serverOptions, proxy, EE));

    proxy.on('open', serverOptions?.callbacks?.proxyOpen.bind(null, serverOptions, proxy, EE) || function (proxySocket) {
        proxySocket.on('data', serverOptions?.callbacks.proxySocketData.bind(null, serverOptions, proxy, EE) || function (d) { console.log(d) });
    }.bind(null, serverOptions, proxy, EE));

    proxy.on('close', serverOptions?.callbacks?.proxyClose.bind(null, serverOptions, proxy, EE) || function (res, socket, head) {
        // // view disconnected websocket connections
        // console.log('Client disconnected');
    }.bind(null, serverOptions, proxy, EE));

    var proxyServer = http.createServer(function (req, res) {
        let opts = { "target": { "protocol": serverOptions?.proxy?.protocol + ":", "host": serverOptions?.proxy?.host, "port": serverOptions?.proxy?.port } }

        /** https://www.npmjs.com/package/http-proxy#https---http */
        /** https://www.npmjs.com/package/http-proxy#https---https */
        /** HTTPS -> HTTP */
        /** HTTPS -> HTTPS */

        /** 1. */
        /** ssl certificates */
        opts = {
            ...opts, "ssl": {
                "key": (!serverOptions?.cert?.keyPath) ? fs.readFileSync(serverOptions?.cert?.keyPath, 'utf8') : serverOptions?.cert?.key,
                "cert": (!serverOptions?.cert?.certPath) ? fs.readFileSync(serverOptions?.cert?.certPath, 'utf8') : serverOptions?.cert?.cert
            }
        }

        /** 2. */
        /** changeOrigin and Secure options additions */
        opts = { ...opts, "changeOrigin": serverOptions?.proxy?.changeOrigin || true, "secure": serverOptions?.proxy?.secure || true }

        /** https://www.npmjs.com/package/http-proxy#http---https-using-a-pkcs12-client-certificate */
        /** HTTP -> HTTPS (using a PKCS12 client certificate) */

        /** 3. */
        /** pfx and passphrase */
        if (!!serverOptions?.cert?.pfx) opts = { ...opts, "pfx": (!!serverOptions?.cert?.pfx) ? fs.readFileSync(serverOptions?.cert?.pfx) : null }
        if (!!serverOptions?.cert?.passphrase) opts = { ...opts, "passphrase": (!!serverOptions?.cert?.passphrase) ? serverOptions?.cert?.passphrase : null }

        proxy.web(req, res, opts);
    }.bind(null, serverOptions, proxy, EE));

    proxyServer.on('upgrade', serverOptions?.callbacks?.proxyUpgrade.bind(null, serverOptions, proxy, EE) || function (req, socket, head) { proxy.ws(req, socket, head); }.bind(null, serverOptions, proxy, EE));
    proxyServer.listen(serverOptions?.proxyPort, serverOptions?.proxyHost, serverOptions?.callbacks?.proxyServerListen);

    return { proxy, proxyServer };
}


/**
 *
 *
 * @param {*} socketOptions
 * @param {*} proxySocketOptions
 * @return {*} 
 * 
 * Credit: https://stackoverflow.com/a/32104777/3204942
 * 
 */
function createNetProxy(socketOptions, proxySocketOptions) {
    const net = require('net');
    const url = require('url');

    socketOptions = {};
    proxySocketOptions = {};

    // create socket server
    let scs = socketServer(socketOptions);

    // create socket client
    let scc = socketClient(proxySocketOptions);

    scc.connect()
    // take all incoming socket server requests to socket client
    return { socketServer: scs, proxySocket: scc };
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


module.exports.httpProxy = httpProxy;
module.exports.serverProxy = serverProxy;
module.exports.reverseProxy = reverseProxy;
module.exports.createNetProxy = createNetProxy;
module.exports.sqlKvStore = sqlKvStore;

module.exports.clusterMasterCallback = clusterMasterCallback;
module.exports.clusterChildCallback = clusterChildCallback;
