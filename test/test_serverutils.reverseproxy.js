const expect = require('chai').expect;
const sinon = require('sinon');
const http = require('http');
const createReverseProxy = require('../index').serverutils.reverseProxy;

describe('reverse proxy', () => {
    let proxyServer, targetServer, requestSpy;
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

    beforeEach((done) => {
        targetServer = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Hello, world!');
        }).listen(serverOptions?.proxy?.port, done);

        requestSpy = sinon.spy(http, 'request');
        
        proxyServer = createReverseProxy(serverOptions).listen(serverOptions?.port);
    });

    afterEach((done) => {
        requestSpy.restore();
        proxyServer.close(() => {
            targetServer.close(done);
        });
    });

    it('proxies requests to target server', (done) => {
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

    it('handles target server errors', (done) => {
        targetServer.close(() => {
            const options = {
                hostname: serverOptions.proxy.host,
                port: serverOptions.proxy.port,
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
