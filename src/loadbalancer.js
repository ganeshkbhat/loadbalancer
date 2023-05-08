/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: loadbalancer.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

function threadingMultiple(size, workerFunction, serverOptions) {
    const { Worker } = require('worker_threads');

    if (size <= 0) return; // base case: stop recursion when n is 0 or negative

    const worker = new Worker(workerFunctions[0]);

    worker.on('message', (msg) => {
        console.log(`Received message from thread ${worker.threadId}: ${msg}`);
    });

    worker.on('error', (err) => {
        console.error(`Error in thread ${worker.threadId}:`, err);
    });

    worker.on('exit', (code) => {
        console.log(`Thread ${worker.threadId} exited with code ${code}`);
    });

    threadingMultiple(size - 1, workerFunctions.slice(1)); // recursive call with remaining functions

    // // Example usage
    // threadingMultiple(3, [
    //     () => {
    //     // This is the worker function that will run in the first thread
    //     console.log(`Worker thread ${worker.threadId} started`);
    //     setInterval(() => {
    //         worker.postMessage(`Hello from thread ${worker.threadId}`);
    //     }, 1000);
    //     },
    //     () => {
    //     // This is the worker function that will run in the second thread
    //     console.log(`Worker thread ${worker.threadId} started`);
    //     // ...
    //     },
    //     () => {
    //     // This is the worker function that will run in the third thread
    //     console.log(`Worker thread ${worker.threadId} started`);
    //     // ...
    //     }
    // ]);
}

function threading(size, workerFunction, serverOptions) {
    const { Worker } = require('worker_threads');

    // base case: stop recursion when n is 0 or negative
    if (size <= 0) {
        // worker.postMessage(serverOptions)
        return;
    };

    const worker = new Worker(workerFunction);

    worker.on('message', (msg) => {
        console.log(`Received message from thread ${worker.threadId}: ${msg}`);
    });

    worker.on('error', (err) => {
        console.error(`Error in thread ${worker.threadId}:`, err);
    });

    worker.on('exit', (code) => {
        console.log(`Thread ${worker.threadId} exited with code ${code}`);
    });

    threading(size - 1, workerFunction); // recursive call

    // // USAGE
    // // Example usage
    // threading(5, () => {
    //     // This is the worker function that will run in each thread
    //     console.log(`Worker thread ${worker.threadId} started`);
    //     setInterval(() => {
    //     worker.postMessage(`Hello from thread ${worker.threadId}`);
    //     }, 1000);
    // });
}

/**
 *
 *
 * @param {*} size
 * @param {boolean} [proxy=true]
 * @param {string} [serverOptions = { protocol: "", createCerts: true, host: "localhost", proxy: { proxy: true, target: "localhost", host: 7000 }, port: 8080, ws: true, mainProcessCallback: () => { }, forkCallback: () => { } }]
 */
function loadbalancer(size, serverOptions) {

    serverOptions = serverOptions || {
        "protocol": "",
        "createCerts": true,
        "host": "localhost",
        "proxy": {
            "proxy": true,
            "target": "localhost",
            "host": 7000
        },
        "port": 8080,
        "ws": true,
        "mainProcessCallback": () => { },
        "forkCallback": () => { }
    }

    const cluster = require('cluster');
    const os = require('os');

    // cluster.js
    if (cluster.isMaster) {
        const cpus = size || os.cpus().length;
        // console.log(`Forking for ${cpus} CPUs`);

        for (let i = 0; i < cpus; i++) {
            cluster.fork();
        }

        const numberOfProcesses = function () {
            this.count = cpus;
            return this.count;
        }

        // Right after the fork loop within the isMaster=true block
        const updateWorkers = () => {
            const usersCount = numberOfProcesses();
            Object.values(cluster.workers).forEach(worker => {
                worker.send({ usersCount });
            });
        };

        updateWorkers();
        setInterval(updateWorkers, 10000);

        cluster.on('exit', (worker, code, signal) => {
            if (code !== 0 && !worker.exitedAfterDisconnect) {
                console.log(`Worker ${worker.id} crashed. ` + 'Starting a new worker...');
                cluster.fork();
            }
        });

        Object.values(cluster.workers).forEach(worker => {
            worker.send(`Hello Worker ${worker.id}`);
        });

        if (!!serverOptions.mainProcessCallback) {
            serverOptions.mainProcessCallback(serverOptions);
        }
    } else {
        serverOptions = serverOptions || require("../server.json");
        if (!!serverOptions.forkCallback) {
            serverOptions.forkCallback(serverOptions, process.pid);
        } else {
            throw new Error("No forkCallback specified in serverOptions");
        }
    }
}

module.exports.loadbalancer = loadbalancer;
module.exports.threading = threading;
module.exports.threadingMultiple = threadingMultiple;
