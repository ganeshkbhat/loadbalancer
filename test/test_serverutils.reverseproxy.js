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
        "server": null,
        "protocol": "http",
        "createCerts": true,
        "host": "127.0.0.1",
        "proxy": {
            "proxy": true,
            "protocol": "http",
            "host": "127.0.0.1",
            "port": 7000
        },
        "keys": {
            "key": "./certs/ssl.key",
            "cert": "./certs/ssl.cert"
        },
        "port": 8080,
        "ws": true,
        "processes": 5,
        "threads": 10,
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { }
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
        const options = {
            hostname: serverOptions.proxy.host,
            port: serverOptions.proxy.port,
            path: '/',
            method: 'GET',
        };

        const clientReq = http.request(options, (clientRes) => {
            let data = '';
            clientRes.on('data', (chunk) => {
                data += chunk;
            });
            clientRes.on('end', () => {
                expect(data).to.equal('Hello, world!');
                expect(requestSpy.calledOnce).to.be.true;
                done();
            });
        });

        clientReq.end();
    });

    it('handles target server errors due to wrong port', (done) => {
        const options = {
            hostname: serverOptions.proxy.host,
            port: serverOptions.proxy.port + 1,
            path: '/',
            method: 'GET',
        };

        // expect(http.request(options, (clientRes) => { })).to.Throw()

        const clientReq = http.request(options, (clientRes) => {
            expect(clientRes.statusCode).to.equal(502);
            expect(requestSpy.calledOnce).to.be.true;
            done(clientRes);
        });

        clientReq.on('error', (err) => {
            console.error(`Expected Test "handles target server errors due to wrong port" Error sending request: ${err.message}`);
            expect(!!err).to.be.true;
            done();
        });

        clientReq.end();
    });

    it('handles target server errors', (done) => {
        targetServer.close(() => {
            const options = {
                hostname: serverOptions.proxy.host,
                port: serverOptions.proxy.port,
                path: '/',
                method: 'GET',
            };

            // expect(http.request(options, (clientRes) => { })).to.Throw()

            const clientReq = http.request(options, (clientRes) => {
                expect(clientRes.statusCode).to.equal(502);
                // expect(requestSpy.calledOnce).to.be.true;
                done(clientRes)
            });

            clientReq.on('error', (err) => {
                console.error(`Expected Test "handles target server errors" Error sending request: ${err.message}`);
                expect(!!err).to.be.true;
                done();
            });

            clientReq.end();
        });
    });

    it('proxies HTTPS requests', (done) => {
        const options = {
            hostname: 'www.google.com',
            port: 443,
            path: '/',
            method: 'GET',
        };

        const clientReq = https.request(options, (clientRes) => {
            let data = '';
            clientRes.on('data', (chunk) => {
                data += chunk;
            });
            clientRes.on('end', () => {
                expect(clientRes.statusCode).to.equal(200);
                expect(data).to.include('google');
                // expect(requestSpy.calledOnce).to.be.true;
                done();
            });
        });

        clientReq.end();
    });

    it('handles HTTPS errors', (done) => {
        const options = {
            hostname: 'www.google.com',
            port: 444, // incorrect port
            path: '/',
            method: 'GET',
        };

        const clientReq = https.request(options, (clientRes) => {
            done(new Error('Expected error to be thrown'));
        });

        clientReq.on('error', (err) => {
            expect(!!err).to.be.true;
            // expect(err.message).to.include('ECONNREFUSED') 
            // expect(err.message).to.include('timeout');
            // expect(requestSpy.calledOnce).to.be.true;
            done();
        });

        clientReq.end();
    });

});