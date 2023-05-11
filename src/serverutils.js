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
                const options = {
                    hostname: serverOptions?.proxy?.host,
                    port: serverOptions?.proxy?.port,
                    path: req.url,
                    method: req.method,
                    headers: req.headers
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

    // create socket server
    // create socket client
    // take all incoming socket server requests to socket client
    return { socketServer, proxySocket };
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
