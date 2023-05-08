/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: test/test_threadsmultiple.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

// const { expect } = require('chai');
// const sinon = require('sinon');
// const { Worker } = require('worker_threads');

// const createThreads = require('../index').loadbalancer.threadingMultiple;

// describe('createThreads', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   it('should create the specified number of threads', () => {
//     const n = 3;
//     const workerFunctions = [
//       sinon.stub(),
//       sinon.stub(),
//       sinon.stub(),
//     ];
//     createThreads(n, workerFunctions);

//     expect(Worker).to.have.callCount(n);
//   });

//   it('should start the correct worker function in each thread', () => {
//     const n = 3;
//     const workerFunctions = [
//       sinon.stub().callsFake(() => console.log('Worker function 1')),
//       sinon.stub().callsFake(() => console.log('Worker function 2')),
//       sinon.stub().callsFake(() => console.log('Worker function 3')),
//     ];
//     createThreads(n, workerFunctions);

//     expect(workerFunctions[0]).to.have.callCount(1);
//     expect(workerFunctions[1]).to.have.callCount(1);
//     expect(workerFunctions[2]).to.have.callCount(1);
//   });

//   it('should handle worker errors', () => {
//     const n = 1;
//     const workerFunctions = [
//       sinon.stub().throws(new Error('Worker error')),
//     ];
//     const consoleError = sinon.stub(console, 'error');

//     createThreads(n, workerFunctions);

//     expect(consoleError).to.have.callCount(1);
//     expect(consoleError.firstCall.args[0]).to.match(/Error in thread \d:/);
//   });

//   it('should handle worker exit', () => {
//     const n = 1;
//     const workerFunctions = [
//       sinon.stub(),
//     ];
//     const consoleLog = sinon.stub(console, 'log');

//     createThreads(n, workerFunctions);

//     expect(consoleLog).to.have.callCount(1);
//     expect(consoleLog.firstCall.args[0]).to.match(/Thread \d exited with code \d/);
//   });
// });