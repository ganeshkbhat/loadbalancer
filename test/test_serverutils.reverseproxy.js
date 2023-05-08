const expect = require('chai').expect;
const sinon = require('sinon');
const http = require('http');
const createReverseProxy = require('../index').serverutils.createReverseProxy;

describe('reverse proxy', () => {
    let proxyServer, targetServer, requestSpy;

    beforeEach((done) => {
        targetServer = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, world!');
        }).listen(8080, done);

        requestSpy = sinon.spy(http, 'request');

        proxyServer = createReverseProxy({
            "server": null,
            "protocol": "http",
            "createCerts": true,
            "host": "localhost",
            "proxy": {
                "proxy": true,
                "protocol": "http",
                "host": "localhost",
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
        }).listen(8443);
    });

    afterEach((done) => {
        requestSpy.restore();
        proxyServer.close(() => {
            targetServer.close(done);
        });
    });

    it('proxies requests to target server', (done) => {
        const options = {
            hostname: 'localhost',
            port: 8443,
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

    it('handles target server errors', (done) => {
        targetServer.close(() => {
            const options = {
                hostname: 'localhost',
                port: 8443,
                path: '/',
                method: 'GET',
            };

            const clientReq = http.request(options, (clientRes) => {
                expect(clientRes.statusCode).to.equal(502);
                expect(requestSpy.calledOnce).to.be.true;
                done();
            });

            clientReq.end();
        });
    });
});
