/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/express.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  // Create worker processes equal to the number of CPUs on the machine
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  // Listen for worker process exit events and replace the exited process
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    cluster.fork();
  });

  let workerIndex = 0;
  const workers = Object.values(cluster.workers);

  // Rotate the worker index for each new request
  function getNextWorker() {
    if (workerIndex >= workers.length) {
      workerIndex = 0;
    }
    const worker = workers[workerIndex];
    workerIndex++;
    return worker;
  }

  // Listen for incoming requests and forward them to a worker process
  const express = require('express');
  const app = express();
  app.get('/', (req, res) => {
    const worker = getNextWorker();
    console.log(`Handling request with worker ${worker.process.pid}`);
    worker.send(req.url);
    worker.on('message', (response) => {
      res.send(response);
    });
  });

  // Start the Express app on a specified port
  const port = 3000;
  app.listen(port, () => {
    console.log(`Master process listening on port ${port}`);
  });
} else {
  const express = require('express');
  const app = express();

  // Add your Express middleware and routes here
  //   app.use(/* middleware */);
  app.get('/', (req, res) => {
    console.log(`Worker ${process.pid} handling request for ${req.url}`);
    res.send(`Hello from process ${process.pid}`);
  });

  // Listen for messages from the master process and respond with the result of processing the request
  process.on('message', (url) => {
    const responseData = `Response from worker ${process.pid}`;
    process.send(responseData);
  });
}
