// const { expect } = require('chai');
// const sinon = require('sinon');
// const { Worker } = require('worker_threads');

// const createThreads = require('../index').loadbalancer.threading;

// describe('createThreads', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   it('should create the specified number of threads', () => {
//     const n = 3;
//     const workerFunction = sinon.stub().callsFake(() => {
//       setInterval(() => {}, 1000);
//     });

//     createThreads(n, workerFunction);

//     expect(Worker).to.have.callCount(n);
//   });

//   it('should handle worker messages', () => {
//     const n = 1;
//     const workerFunction = sinon.stub().callsFake(() => {
//       setInterval(() => {
//         worker.postMessage('Test message');
//       }, 1000);
//     });
//     const consoleLog = sinon.stub(console, 'log');

//     createThreads(n, workerFunction);

//     expect(consoleLog).to.have.callCount(n);
//     expect(consoleLog.firstCall.args[0]).to.match(/Received message from thread \d:/);
//   });

//   it('should handle worker errors', () => {
//     const n = 1;
//     const workerFunction = sinon.stub().callsFake(() => {
//       throw new Error('Worker error');
//     });
//     const consoleError = sinon.stub(console, 'error');

//     createThreads(n, workerFunction);

//     expect(consoleError).to.have.callCount(n);
//     expect(consoleError.firstCall.args[0]).to.match(/Error in thread \d:/);
//   });

//   it('should handle worker exit', () => {
//     const n = 1;
//     const workerFunction = sinon.stub().callsFake(() => {
//       setTimeout(() => {
//         process.exit(1);
//       }, 1000);
//     });
//     const consoleLog = sinon.stub(console, 'log');

//     createThreads(n, workerFunction);

//     expect(consoleLog).to.have.callCount(n);
//     expect(consoleLog.firstCall.args[0]).to.match(/Thread \d exited with code \d/);
//   });
// });
