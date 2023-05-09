/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: test/test_serverutils.http.js
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
const fs = require("fs");
const server = require('../index').serverutils.server;

describe('server', () => {
    let targetServer;
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
        "mainProcessCallback": () => {
            expect(requestSpy.calledOnce).to.be.true;
        },
        "forkCallback": (opts, pr) => {
            expect(requestSpy.calledOnce).to.be.true;
        }
    }

    beforeEach(() => {
        targetServer = server(serverOptions) //.listen(8443);
        requestSpy = sinon.spy(http, 'request');
    });

    afterEach((done) => {
        requestSpy.restore();
        targetServer.close();
        done();
    });


    it('should start a HTTP server on default port and host', () => {
        const srv = server(serverOptions);
        // expect(srv.listening).to.be.true;
        expect(srv.address()).to.equal(serverOptions.port);
        expect(srv.address().address).to.equal(serverOptions.host);
        srv.close();
    });

    it('should start a HTTPS server on specified port and host', () => {
        const srv = server(serverOptions);
        // expect(srv.listening).to.equal(true);
        expect(srv.address().port).to.equal(serverOptions.port);
        expect(srv.address().address).to.equal(serverOptions.host);
        srv.close();
    });

    it('should call the provided callback when a request is received', done => {
        const callback = (req, res) => {
            res.end('Hello World!');
            expect(requestSpy.calledOnce).to.be.true;
        };
        const srv = server(serverOptions, callback);
        http.get(serverOptions.protocol + "://" + serverOptions.host + ":" + serverOptions.port, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                expect(data).to.equal('Hello World!');
                srv.close();
                done();
            });
        });
    });

    it('should call the provided listencallback when the server starts', () => {
        let listencb = sinon.spy(listencallback);
        const listencallback = () => {
            console.log("Starting server");
            expect(listencb.calledOnce).to.be.true;
            done();
        };
        server(serverOptions, null, listencallback);

    });
});


describe('server tests two', () => {
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
        "mainProcessCallback": () => {
            expect(requestSpy.calledOnce).to.be.true;
        },
        "forkCallback": (opts, pr) => {
            expect(requestSpy.calledOnce).to.be.true;
        }
    }

    afterEach(() => {
        sinon.restore();
    });

    it('should start a HTTP server on default port and host', () => {
        // const serverOptions = {};
        const srv = server(serverOptions);
        expect(srv.listening).to.be.true;
        expect(srv.address().port).to.equal(serverOptions?.port);
        expect(srv.address().address).to.equal(serverOptions?.host);
        srv.close();
    });

    it('should start a HTTPS server on specified port and host', () => {
        // const serverOptions = {
        //     protocol: 'https',
        //     port: 8443,
        //     host: '127.0.0.1',
        //     keys: {
        //         key: './tests/certs/ssl.key',
        //         cert: './tests/certs/ssl.cert'
        //     }
        // };
        const fsStub = sinon.stub(fs, 'readFileSync').returns('dummy cert');
        const srv = server(serverOptions);
        expect(srv.listening).to.be.true;
        expect(srv.address().port).to.equal(serverOptions.port);
        expect(srv.address().address).to.equal(serverOptions.host);
        srv.close();
    });

    it('should call the provided callback when a request is received', done => {
        // const serverOptions = {};
        const callback = (req, res) => {
            res.end('Hello World!');
        };
        const srv = server(serverOptions, callback);
        const httpStub = sinon.stub(http, 'get').callsArgWith(1, { on: sinon.stub().callsArgWith(1, 'Hello World!'), end: sinon.stub() });
        srv.on('listening', () => {
            http.get(serverOptions.protocol + '://' + serverOptions.host + ':' + serverOptions.port);
        });
        srv.on('close', () => {
            expect(httpStub.calledOnce).to.be.true;
            done();
        });
    });

    it('should call the provided listencallback when the server starts', () => {
        // const serverOptions = {};
        const listencallback = sinon.stub();
        const consoleStub = sinon.stub(console, 'log');
        server(serverOptions, null, listencallback);
        expect(listencallback.calledOnce).to.be.true;
        expect(consoleStub.calledWithMatch(`Started process ${serverOptions.port}`)).to.be.true;
    });
});
