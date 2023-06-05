### What is the problem this feature will solve?

`Clustering of threads`, basically `similar to clustered thread pools with features same as Cluster module`.

[https://github.com/ganeshkbhat/loadbalancer/blob/4f15c79434797ccaf17aeae6f6a3f4c47f0e5703/nodejs.proposal.md](https://github.com/ganeshkbhat/loadbalancer/blob/4f15c79434797ccaf17aeae6f6a3f4c47f0e5703/nodejs.proposal.md)

### What is the feature you are proposing to solve the problem?


`Clustered threads module`: The module `Clustered threads module` which is basically `Clustering of threads` will be `similar to clustered thread pools with features same as inbuilt Cluster module` based on child_process.fork() features with minor differences.


`Clustering of threads`, basically similar to `Cluster module` where `each thread` based on specification can: 

1. `listen` to `same port`
2. `listen` to `different ports`


### Background: 


#### `nodejs module: cluster` [cluster](https://nodejs.org/api/cluster.html#how-it-works)

1. The worker processes are spawned using the child_process.fork() method, so that they can communicate with the parent via IPC and pass server handles back and forth. 
2. The cluster module supports two methods of distributing incoming connections. 
    * The `first one` (and the default one on all platforms except Windows) is the `round-robin approach`, where the primary process listens on a port
    * The `second approach` is where the primary process creates the listen socket and `sends it to interested workers`.

3. Because `server.listen()` `hands off` `most` of the `work to` the `primary process`, there are three cases where the behavior between a normal `Node.js process and a cluster worker differs`:

    a.) `server.listen({fd: 7})` Because the message is passed to the primary, `file descriptor 7` in the parent `will be listened on`, and the `handle passed to the worker`, rather than listening to the worker's idea of what the number 7 file descriptor references.

    b.) `server.listen(handle)` Listening on handles explicitly will cause the `worker to use the supplied handle`, rather than talk to the primary process.
    
    c.) `server.listen(0)` Normally, this `will cause servers` to `listen on a random port`. However, in a cluster, `each worker will receive the same "random" port` each time they do listen(0). In essence, the port is random the first time, but predictable thereafter. `To listen on a unique port, generate a port number based on the cluster worker ID`.

### CHILD PROCESS PORT SHARING: 

* `shares the same port` [process.same.port.js](https://github.com/ganeshkbhat/loadbalancer/blob/4f15c79434797ccaf17aeae6f6a3f4c47f0e5703/demos/process.same.port.js):
```
const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```


* `shares a different port` [process.different.port.js](https://github.com/ganeshkbhat/loadbalancer/blob/4f15c79434797ccaf17aeae6f6a3f4c47f0e5703/demos/process.different.port.js):
```
const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(process.pid);

  console.log(`Worker ${process.pid} started`);
}
```


### RECOMMENDED AND EXPECTED WORKER THREAD CLUSTER MODULE AND PORT SHARING like cluster module: 

* `shares the same port`:

```
const cluster_thread = require('node:cluster_thread');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');
let workers = [];

if (cluster_thread.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    workers[i] = new cluster_thread.Worker(__filename, {
        workerData: script,
    });
  }

  workers[i].on('exit', (worker, code, signal) => {
   console.log(`worker ${worker.process.pid} died`);
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);

  console.log(`Worker ${process.pid}, ${cluster_thread.worker.threadId} started`);
}
```


* `shares a different port`:
```
const cluster_thread = require('node:cluster_thread');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');
let workers = [];

if (cluster_thread.isMainThread) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    workers[i] = new cluster_thread.Worker(__filename, {
        workerData: script,
    });
  }

  workers[i].on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(cluster_thread.worker.threadId);

  console.log(`Worker ${process.pid}, ${cluster_thread.worker.threadId} started`);
}
```


### What alternatives have you considered?

#### `nodejs module: cluster` [cluster](https://nodejs.org/api/cluster.html#how-it-works) basd on `child_process` will be more resource intensive than worker_threads based `cluster_threads` module
