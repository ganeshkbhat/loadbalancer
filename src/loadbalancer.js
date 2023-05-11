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

const { ServerResponse } = require('http');


/**
 *
 *
 * @param {*} serverOptions
 * @param {*} workerFunctions
 * @return {*} 
 */
function threadingMultiple(serverOptions, workerFunctions) {
    const { Worker } = require('worker_threads');

    serverOptions = serverOptions || {
        "server": null,
        "protocol": "http",
        "createCerts": true,
        "host": "localhost",
        "proxy": {
            "proxy": true,
            "protocol": "http",
            "host": "localhost",
            "port": 7000,
            "proxyHost": "",
            "proxyPort": 9000
        },
        "certs": {
            "key": "./certs/ssl.key",
            "cert": "./certs/ssl.cert"
        },
        "port": 8080,
        "ws": true,
        "processes": 5,
        "threads": 10,
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        }
    }

    if (serverOptions?.threads <= 0) return; // base case: stop recursion when n is 0 or negative

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

    threadingMultiple(serverOptions?.threads - 1, workerFunctions.slice(1)); // recursive call with remaining functions

    // // Example usage
    // threadingMultiple(serverOptions, [
    //     () => {
    //          // This is the worker function that will run in the first thread
    //          console.log(`Worker thread ${worker.threadId} started`);
    //          setInterval(() => {
    //              worker.postMessage(`Hello from thread ${worker.threadId}`);
    //          }, 1000);
    //     },
    //     () => {
    //          // This is the worker function that will run in the second thread
    //          console.log(`Worker thread ${worker.threadId} started`);
    //          // ...
    //     },
    //     () => {
    //          // This is the worker function that will run in the third thread
    //          console.log(`Worker thread ${worker.threadId} started`);
    //          // ...
    //     }
    // ]);
}


/**
 *
 *
 * @param {*} serverOptions
 * @param {*} workerFunction
 * @return {*} 
 */
function threading(serverOptions, workerFunction) {
    const { Worker } = require('worker_threads');

    serverOptions = serverOptions || {
        "server": null,
        "protocol": "http",
        "createCerts": true,
        "host": "localhost",
        "proxy": {
            "proxy": true,
            "protocol": "http",
            "host": "localhost",
            "port": 7000,
            "proxyHost": "",
            "proxyPort": 9000
        },
        "certs": {
            "key": "./certs/ssl.key",
            "cert": "./certs/ssl.cert"
        },
        "port": 8080,
        "ws": true,
        "processes": 5,
        "threads": 10,
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        }
    }

    // base case: stop recursion when n is 0 or negative
    if (serverOptions?.threads <= 0) {
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

    threading(serverOptions?.threads - 1, workerFunction); // recursive call

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
 * @param {string} serverOptions
 * Default value: {
        "server": null,
        "protocol": "http",
        "createCerts": true,
        "host": "localhost",
        "proxy": {
            "proxy": true,
            "protocol": "http",
            "host": "localhost",
            "port": 7000,
            "proxyHost": "",
            "proxyPort": 9000
        },
        "certs": {
            "key": "./certs/ssl.key",
            "cert": "./certs/ssl.cert"
        },
        "port": 8080,
        "ws": true,
        "processes": 5,
        "threads": 10,
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        }
    }
 */
function loadbalancer(serverOptions) {
    serverOptions = serverOptions || {
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
        "certs": {
            "key": "./certs/ssl.key",
            "cert": "./certs/ssl.cert"
        },
        "port": 8080,
        "ws": true,
        "processes": 5,
        "threads": 10,
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "server": null,
            "listen": null
        }
    }

    const cluster = require('cluster');
    const process = require('process');
    const os = require('os');

    // cluster.js
    if (cluster.isMaster) {
        const cpus = serverOptions?.processes || os.cpus().length;
        // console.log(`Forking for ${cpus} CPUs`);

        for (let i = 0; i < cpus; i++) {
            if (!!serverOptions.setupPrimary) {
                // { exec: 'worker.js', args: ['--use', 'http'] }
                cluster.setupPrimary(serverOptions.setupPrimary);
            }
            cluster.fork();
        }

        // Right after the fork loop within the isMaster=true block
        const updateWorkers = (cpus) => {
            const usersCount = cpus;
            Object.values(cluster.workers).forEach(worker => {
                worker.send({ usersCount });
            });
        };

        updateWorkers(cpus);
        setInterval(updateWorkers, 10000);

        const workerEvents = () => {
            Object.values(cluster.workers).forEach(worker => {
                worker.on("close", function (data) {
                    console.log(`A worker ${worker.id} is now closing connection to ${data} - ${arguments}`);
                });

                worker.on("exit", function (code, signal) {
                    console.log(`A worker ${worker.id} is now exiting connection: ${code}, ${signal} - ${arguments}`);
                });

                worker.on("error", function (err) {
                    console.log(`A worker ${worker.id} is facing error in connection to - ${err} - ${arguments}`);
                });
            });
        }

        cluster.on('disconnect', (worker) => {
            console.log(`A worker ${worker.id} is now disconnected.`);
        });

        cluster.on('exit', (worker, code, signal) => {
            if (code !== 0 && !worker.exitedAfterDisconnect) {
                console.log(`Worker ${worker.id} crashed. ` + 'Starting a new worker.');
                cluster.fork();
            }
        });

        cluster.on('listening', (worker, address) => {
            console.log(`A worker ${worker.id} is now connected to ${address.address}:${address.port}.`);
        });

        cluster.on('online', (worker) => {
            console.log(`A worker ${worker.id} has responded after it was forked.`);
        });

        cluster.on('setup', (worker) => {
            console.log(`A worker ${worker.id} has responded after it was forked setup.`);
        });

        cluster.on('fork', (worker) => {
            console.log(`A worker ${worker.id} has responded after it was forked.`);
        });

        Object.values(cluster.workers).forEach(worker => {
            worker.send(`Hello to Worker - ${worker.id}`);
        });

        if (!!serverOptions?.mainProcessCallback) {
            serverOptions.mainProcessCallback(serverOptions);
        }

        console.log(`Cluster started on ${process.env.NODE_UNIQUE_ID}`);
    } else {
        if (!!serverOptions?.forkCallback) {
            serverOptions.forkCallback(serverOptions, process);
        } else {
            throw new Error("No forkCallback specified in serverOptions");
        }
    }
}


module.exports.loadbalancer = loadbalancer;
module.exports.threading = threading;
module.exports.threadingMultiple = threadingMultiple;
