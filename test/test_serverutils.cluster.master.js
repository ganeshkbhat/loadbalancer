/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: test/test_serverutils.cluster.master.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';
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
const server = require('../index').sockets.server;

describe('cluster tests master', () => {
    let targetServer;
    let requestSpy;

    let serverOptions = {

    }

    beforeEach(() => {
        targetServer = server(serverOptions) //.listen(8443);
        requestSpy = sinon.spy(http, 'request');
    });

    afterEach(() => {
        sinon.restore();
    });

    afterEach((done) => {
        requestSpy.restore();
        targetServer.close();
        done();
    });


    it('should start a HTTP server on default port and host', () => {

    });

});
