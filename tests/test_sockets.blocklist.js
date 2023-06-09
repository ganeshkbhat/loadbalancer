/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/sockets.blocklist.js
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

var SocketBlocklist = require("../index").sockets.SocketBlocklist;

let sbl = new SocketBlocklist();

console.log(sbl.rules);

sbl.addAddress("127.0.0.1");
sbl.addRange("192.168.0.1", "192.168.0.10");
sbl.addSubnet("127.0.0.1", 32);
console.log(sbl.check("129.0.0.1"));

console.log(sbl.rules);

