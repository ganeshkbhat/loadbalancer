/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/loadbalancer-reverseproxy.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var loadbalancer = require("../index").loadbalancer;
var httpProxy = require("../index").serverutils.httpProxy;
var server = require("./express-app");

httpProxy({
    "server": server,
    "protocol": "http",
    "createCerts": true,
    "host": "127.0.0.1",
    "proxy": {
        "proxy": true,
        "protocol": "http",
        "host": "127.0.0.1",
        "port": 7000,
        "proxyHost": "",
        "proxyPort": 9000,
        "changeOrigin": true,
        "secure": true,
        "pfx": null,
        "passphrase": null,
        "proxyUpgrade": null
    },
    "certs": {
        "keyPath": "./certs/ssl.key",
        "certPath": "./certs/ssl.cert"
    },
    "port": 8000,
    "ws": true,
    "processes": 5,
    "threads": 10,
    "mainProcessCallback": () => { },
    "forkCallback": (opts, pr) => {
        // console.log(opts, pr);
        // httpProxy(opts);
    },
    "callbacks": {
        "wsOnData": null,
        "wsOnEnd": null,
        "wsUpgrade": null,
        "server": null,
        "listen": () => console.log("proxyListen started"),
        "proxyListen": () => console.log("proxyListen started"),
        "proxyServerListen": () => console.log("proxyServerListen started"),
        "proxyInterceptor": (p, r, s, o) => console.log("p, r, s, o"),
        "proxyInterceptorRequest": (p, r, s, o) => console.log("p, r, s, o - rq"),
        "proxyInterceptorRequestWS": (p, r, s, o) => console.log("p, r, s, o - rqws"),
        "proxyInterceptorResponse": (p, r, s, o) => console.log("p, r, s, o - rs"),
        "proxyOpen": (e) => console.log("o"),
        "proxyError": (e) => console.log("e", e),
        "proxyClose": (r, s, h) => console.log("r, s, h"),
        "proxyUpgrade": (r, s, h) => console.log("r, s, h")
    }
});

