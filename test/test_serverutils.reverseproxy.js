/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: test/test_serverutils.reverseproxy.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const http = require('http');
const https = require('https');
const { expect } = require('chai');
const sinon = require('sinon');
const createReverseProxy = require('../index').serverutils.reverseProxy;


describe('HTTP proxy', () => {
    let targetServer;
    let proxyServer;
    let requestSpy;

    let serverOptions = {

    }

    beforeEach(() => {
        targetServer = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, world!');
        }).listen(serverOptions?.proxy?.port);

        proxyServer = createReverseProxy(serverOptions) //.listen(8443);
        requestSpy = sinon.spy(http, 'request');
    });

    afterEach((done) => {
        requestSpy.restore();
        proxyServer.close();
        targetServer.close();
        done();
        // try {
        //     proxyServer.close(() => {
        //         targetServer.close(done);
        //     });
        // } catch (e) {
        //     // console.log(e)
        // }

    });

    it('proxies HTTP requests', (done) => {

    });

    it('handles target server errors due to wrong port', (done) => {

    });

    it('handles target server errors', (done) => {

    });

    it('proxies HTTPS requests', (done) => {

    });

    it('handles HTTPS errors', (done) => {

    });

});
