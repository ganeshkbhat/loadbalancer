/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: test/test_loadbalancer.threads.js
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

const { expect } = require('chai');
const sinon = require('sinon');
const { Worker } = require('worker_threads');

const threading = require('../index').loadbalancer.threading;

describe('threading and loadbalancer', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('should create the specified number of threads', () => {

    });

    it('should handle worker messages', () => {

    });

    it('should handle worker errors', () => {

    });

    it('should handle worker exit', () => {

    });
});
