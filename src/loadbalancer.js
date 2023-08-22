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
const { Randomize, Sequential, Sticky, Weighted, SingleMaxload } = require("./algorithms");


function processRouterAlgorithm(serverOptions, cluster) {
    let fnName = serverOptions.router;
    let router = null;
    switch (fnName) {
        case Randomize:
            router = Randomize();
            break;
        case Sequential:
            router = Sequential();
            break;
        case Sticky:
            router = Sticky();
            break;
        case Weighted:
            router = Weighted();
            break;
        case SingleMaxload:
            router = SingleMaxload();
            break;
        case "default":
            router = Randomize();
            break;
    }

    if (router !== null) {

    }
}


/**
 *
 *
 * @param {*} serverOptions
 * @param {*} workerFunctions
 * @return {*} 
 */
function threadingMultiple(serverOptions, workerFunctions) {
    const { Worker } = require('worker_threads');
    let wkrFnsCopy = new Array(...workerFunctions);
    let wkrFns = [];

    serverOptions = {
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
        "port": 8000,
        "ws": true,
        "processes": 5,
        "threads": 10,
        // Consider: setupPrimary or runtime
        "runtime": {
            "type": "", // exec, execFile, fork, spawn, execFileSync, execSync, spawnSync
            "command": "",
            "args": {},
            "env": {},
            "options": {}
        },
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        },
        ...serverOptions
    }

    // base case: stop recursion when n is 0 or negative
    if (serverOptions?.threads <= 0) return;

    for (let i = 0; i < serverOptions.threads; i++) {
        serverOptions.threads = serverOptions?.threads - 1;

        let wkFns;
        if (!!Array.isArray(workerFunctions) && workerFunctions.length > 1) {
            wkFns = workerFunctions[i];
        } else if (!!Array.isArray(workerFunctions) && workerFunctions.length === 1) {
            wkFns = workerFunctions[0];
        } else if (typeof workerFunctions === "object" || typeof workerFunctions === "function") {
            wkFns = workerFunctions;
        }

        wkrFns[i] = threading(serverOptions, [wkFns]);
    }

    return wkrFns;
}

const threadpool = threadingMultiple;


/**
 *
 *
 * @param {*} serverOptions
 * @param {*} workerFunction
 * @return {*} 
 */
function threading(serverOptions, workerFunction) {
    const { Worker } = require('worker_threads');

    serverOptions = {
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
        "port": 8000,
        "ws": true,
        "processes": 5,
        "threads": 10,
        // Consider: setupPrimary or runtime
        "runtime": {
            "type": "", // exec, execFile, fork, spawn, execFileSync, execSync, spawnSync
            "command": "",
            "args": {},
            "env": {},
            "options": {}
        },
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        },
        ...serverOptions
    }

    // base case: stop recursion when n is 0 or negative
    if (serverOptions?.threads <= 0) {
        // worker.postMessage(serverOptions)
        return;
    };

    const worker = new Worker((!!workerFunction[0]?.filename) ? workerFunction[0]?.filename : (!workerFunction[0]) ? workerFunction[0] : workerFunction, {

    });

    // {
    //     argv: [""], env: {},
    //     eval: false, execArgv: [],
    //     stdin: true, stdout: true,
    //     stderr: true, workerData: {},
    //     trackUnmanagedFds: true, transferList: [],
    //     resourceLimits: {
    //         // maxOldGenerationSizeMb: 0,
    //         // maxYoungGenerationSizeMb: 0,
    //         // codeRangeSizeMb: 0,
    //         // stackSizeMb: 0
    //     },
    //     name: ""
    // });

    worker.on('message', (msg) => {
        console.log(`Received message from thread ${worker.threadId}: ${msg}`);
    });

    worker.on('error', (err) => {
        console.error(`Error in thread ${worker.threadId}:`, err);
    });

    worker.on('exit', (code) => {
        console.log(`Thread ${worker.threadId} exited with code ${code}`);
    });

    // threading(serverOptions?.threads - 1, workerFunction); // recursive call

    // // USAGE
    // // Example usage
    // threading(5, () => {
    //     // This is the worker function that will run in each thread
    //     console.log(`Worker thread ${worker.threadId} started`);
    //     setInterval(() => {
    //     worker.postMessage(`Hello from thread ${worker.threadId}`);
    //     }, 1000);
    // });

    return worker;
}


/**
 *
 *
 * @param {*} serverOptions
 */
function clustering(serverOptions) {

    serverOptions = {
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
        "port": 8000,
        "ws": true,
        "processes": 5,
        "threads": 10,
        // Consider: setupPrimary or runtime
        "runtime": {
            "type": "", // exec, execFile, fork, spawn, execFileSync, execSync, spawnSync
            "command": "",
            "args": {},
            "env": {},
            "options": {}
        },
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        },
        ...serverOptions
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
            serverOptions.mainProcessCallback(serverOptions, cluster);
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


/**
 *
 *
 * @param {*} serverOptions
 */
function processing(serverOptions, workerFunction) {
    const { execFile, spawn, fork } = require("child_process");

}


function processingMultiple(serverOptions, workerFunctions) {
    let wkrFnsCopy = new Array(...workerFunctions);
    let wkrFns = [];

    serverOptions = {
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
        "port": 8000,
        "ws": true,
        "processes": 5,
        "threads": 10,
        // Consider: setupPrimary or runtime
        "runtime": {
            "type": "", // exec, execFile, fork, spawn, execFileSync, execSync, spawnSync
            "command": "",
            "args": {},
            "env": {},
            "options": {}
        },
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        },
        ...serverOptions
    }

    // base case: stop recursion when n is 0 or negative
    if (serverOptions?.processes <= 0) return;

    for (let i = 0; i < serverOptions.processes; i++) {
        serverOptions.processes = serverOptions?.processes - 1;
        let wkFns;
        if (!!Array.isArray(workerFunctions) && workerFunctions.length > 1) {
            wkFns = workerFunctions[i];
        } else if (!!Array.isArray(workerFunctions) && workerFunctions.length === 1) {
            wkFns = workerFunctions[0];
        } else if (typeof workerFunctions === "object" || typeof workerFunctions === "function") {
            wkFns = workerFunctions;
        }

        wkrFns[i] = processing(serverOptions, [wkFns]);
    }

    return wkrFns;
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
        "port": 8000,
        "ws": true,
        "processes": 5,
        "threads": 10,
        // Consider: setupPrimary or runtime
        "runtime": {
            "type": "", // exec, execFile, fork, spawn, execFileSync, execSync, spawnSync
            "command": "",
            "args": {},
            "env": {},
            "options": {}
        },
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        },
        ...serverOptions
    }
 */
function loadbalancer(serverOptions) {

    // TODO: 
    // Move to mix of Processing, Clustering, Threads, ThreadPool based mixed implementation
    // Specifications will be in serverOptions
    // Process > Cluster/ ProcessingMulti/ Process > Parent Algo + Parent Callback > Worker Callback > Worker Can implement their own threads
    // Thread > ThreadPool/ ThreadingMulti/ Thread > Parent Algo + Parent Callback > Worker Callback > Worker Can implement their own processes

    /** 
        Loadbalancer.call(this, serverOptions);

        this.processing = (serverOptions, workerFunction) => processing(serverOptions, workerFunction);
        this.processingMultiple = (serverOptions, workerFunctions) => processing(serverOptions, workerFunctions);
        this.cluster = (serverOptions) => clustering(serverOptions);
        this.threading = threading(serverOptions, workerFunction);
        this.threadingMultiple = threadingMultiple(serverOptions, workerFunctions);
        this.loadbalancer = function (serverOptions) {

        };
     */

    return clustering(serverOptions);

}



module.exports.threading = threading;
module.exports.threadingMultiple = threadingMultiple;
module.exports.processing = processing;
module.exports.processingMultiple = processingMultiple;
module.exports.clustering = clustering;
module.exports.loadbalancer = loadbalancer;

