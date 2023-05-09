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
var reverseProxy = require("../index").serverutils.reverseProxy;
var server = require("./express-app");

loadbalancer.loadbalancer({
    "server": server,
    "protocol": "http",
    "createCerts": true,
    "host": "localhost",
    "proxy": {
        "proxy": true,
        "target": "localhost",
        "host": 7000
    },
    "keys": {
        "key": './certs/ssl.key',
        "cert": './certs/ssl.cert'
    },
    "port": 8080,
    "ws": true,
    "processes": 5,
    "threads": 10,
    "mainProcessCallback": () => {

    },
    "forkCallback": (opts, pr) => {
        // console.log(opts, pr);
        // console.log(opts);
        reverseProxy(opts);
    }
})


