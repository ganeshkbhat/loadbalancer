/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/loadbalancer-threads.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var path = require("path");
var loadbalancer = require("../index").loadbalancer;
var httpSocketServer = require("../index").sockets.httpSocketServer;
// var express = require("./expressapp");

loadbalancer.threading({
    "server": null,
    "protocol": "http",
    "createCerts": true,
    "host": "127.0.0.1",
    "proxy": {
        "proxy": true,
        "protocol": "http",
        "host": "localhost",
        "port": 7000,
        "proxyHost": "",
        "proxyPort": 9000
    },
    "certs": {
        "key": "../certs/ssl.key",
        "cert": "../certs/ssl.cert"
    },
    "port": 8000,
    "ws": true,
    "processes": 5,
    "threads": 1,
    "mainProcessCallback": () => { },
    "forkCallback": (opts, pr) => {
        // console.log(opts, pr);
        // console.log(opts);
        // httpSocketServer(opts);
    },
    "callbacks": {
        "wsOnData": null,
        "wsOnEnd": null,
        "wsUpgrade": null,
        "server": null,
        "listen": null
    }
}, [{ filename: path.join(__dirname, "./expressapp.js"), options: {} }])

