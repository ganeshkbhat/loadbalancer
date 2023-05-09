/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/algorithms.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var loadbalancer = require("../index").loadbalancer;
var algorithms = require("../index").algorithms;

let wInst = new algorithms.Weighted(["127.0.0.1:8000", "127.0.0.1:8001"]);

console.log("wInst.len(): should be 2: ", wInst.pools.length);
console.log("Adding a new item as an array , ['127.0.0.1:9001']");
wInst.addPools(["127.0.0.1:9001"]);
console.log("wInst.len(): should be 3: ", wInst.len());
console.log('["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:9001"]: ', wInst.pools.length);
console.log("Adding a new item as an array , ['127.0.0.1:9002']");
wInst.addPools("127.0.0.1:9002");
console.log('["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:9001", "127.0.0.1:9002"]: ', wInst.pools);
console.log("wInst.weighted()", wInst.weighted());
console.log("wInst.lastIndex", wInst.lastIndex);
console.log("wInst.nextIndex", wInst.nextIndex);
console.log("wInst.weighted()", wInst.weighted());
console.log("wInst.lastIndex", wInst.lastIndex);
console.log("wInst.nextIndex", wInst.nextIndex);
console.log("\n\n");

let rInst = new algorithms.Randomize(["127.0.0.1:8000", "127.0.0.1:8001"]);

console.log("rInst.len(): should be 2: ", rInst.pools.length);
console.log("Adding a new item as an array , ['127.0.0.1:9001']");
rInst.addPools(["127.0.0.1:9001"]);
console.log("rInst.len(): should be 3: ", rInst.len());
console.log('["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:9001"]: ', rInst.pools.length);
console.log("Adding a new item as an array , ['127.0.0.1:9002']");
rInst.addPools("127.0.0.1:9002");
console.log('["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:9001", "127.0.0.1:9002"]: ', rInst.pools);
console.log("rInst.randomize()", rInst.randomize());
console.log("rInst.lastIndex", rInst.lastIndex);
console.log("rInst.nextIndex", rInst.nextIndex);
console.log("rInst.randomize()", rInst.randomize());
console.log("rInst.lastIndex", rInst.lastIndex);
console.log("rInst.nextIndex", rInst.nextIndex);
console.log("\n\n");

let sInst = new algorithms.Sequential(["127.0.0.1:8000", "127.0.0.1:8001"]);

console.log("sInst.len(): should be 2: ", sInst.pools.length);
console.log("Adding a new item as an array , ['127.0.0.1:9001']");
sInst.addPools(["127.0.0.1:9001"]);
console.log("sInst.len(): should be 3: ", sInst.len());
console.log('["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:9001"]: ', sInst.pools.length);
console.log("Adding a new item as an array , ['127.0.0.1:9002']");
sInst.addPools("127.0.0.1:9002");
console.log('["127.0.0.1:8000", "127.0.0.1:8001", "127.0.0.1:9001", "127.0.0.1:9002"]: ', sInst.pools);
console.log("sInst.sequential()", sInst.sequential());
console.log("sInst.lastIndex", sInst.lastIndex);
console.log("sInst.nextIndex", sInst.nextIndex);
console.log("sInst.sequential()", sInst.sequential());
console.log("sInst.lastIndex", sInst.lastIndex);
console.log("sInst.nextIndex", sInst.nextIndex);
console.log("\n\n");

