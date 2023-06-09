/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/loadbalancer-ws.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const { Worker } = require('worker_threads');

const threadingMultiple = require('../index').loadbalancer.threadingMultiple;

describe('multiple threading and loadbalancer', () => {

  afterEach(() => {
    sinon.restore();
  });

  it('should create the specified number of threads', () => {

  });

  it('should start the correct worker function in each thread', () => {

  });

  it('should handle worker errors', () => {

  });

  it('should handle worker exit', () => {

  });

});


/* eslint no-console: 0 */

'use strict';

var loadbalancer = require("../index").loadbalancer;
var wsSocketServer = require("../index").sockets.wsSocketServer;
var server = require("./express-app");

loadbalancer.loadbalancer({
    "server": server,
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
    "forkCallback": (opts, pr) => {
        // console.log(opts, pr);
        // console.log(opts);
        wsSocketServer(opts);
    },
    "callbacks": {
        "wsOnData": null,
        "wsOnEnd": null,
        "wsUpgrade": null,
        "server": null,
        "listen": null
    }
})
