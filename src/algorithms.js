/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: algorithms.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

function poolsInstance(pools) {
    this.pools = [];
    this.addPools = function (pools) {
        if (typeof pools === "string") {
            this.pools.push({ host: pools, weight: 1, max: pools?.max || 1000, requests: 0, total: 0, open: 0, closed: 0, currentWeight: 0 });
        } else if (Array.isArray(pools)) {
            for (let i = 0; i < pools.length; i++) {
                if (typeof pools[i] === "string") {
                    this.pools.push({ host: pools[i], weight: 1, max: pools?.max || 1000, requests: 0, total: 0, open: 0, closed: 0, currentWeight: 0 });
                } else if (typeof pools[i] === "object") {
                    if (!pools[i]?.host) throw new Error("Host not provided");
                    this.pools.push({ host: pools[i]?.host, weight: (!pools[i]?.weight) ? pools[i]?.weight : 1, max: pools?.max || 1000, requests: 0, total: 0, open: 0, closed: 0, currentWeight: 0 });
                }
            }
        } else if (typeof pools === "object") {
            this.pools.push({ host: pools[i]?.host, weight: (!pools[i]?.weight) ? pools[i]?.weight : 1, max: pools?.max || 1000, requests: 0, total: 0, currentWeight: 0 })
        }
    }

    return {
        pools: this.pools,
        len: this.pools.length,
        addPools: (p) => { this.addPools(p) }
    }
}

function sortPoolsByKey(arr, key, order = "desc") {
    if (order === "desc") {
        arr.sort((a, b) => a[key] - b[key]);
    } else if (order === "asc") {
        arr.sort((a, b) => b[key] - a[key]);
    }
    return arr;
}

function sortPoolsByKeys(arr, key, key2, order = "desc") {
    if (order === "desc") {
        arr.sort((a, b) => {
            if (a[key] > b[key]) return -1;
            if (a[key] < b[key]) return 1;
            if (a[key2] > b[key2]) return -1;
            if (a[key2] < b[key2]) return 1;
            return 0;
        });
    } else if (order === "asc") {
        arr.sort((a, b) => {
            if (a[key] < b[key]) return -1;
            if (a[key] > b[key]) return 1;
            if (a[key2] < b[key2]) return -1;
            if (a[key2] > b[key2]) return 1;
            return 0;
        });
    }
    return arr;
}

function closeConnections(pools, index) {
    pools[index].open = pools[index].open - 1;
    pools[index].closed = pools[index].closed + 1;
    return pools;
}

function loaderWeighted(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    function weighted() {
        this.pools = sortPoolsByKeys(this.pools, "currentWeight", "weight", "desc");
        this.pools[0].open = this.pools[0].open + 1;
        this.pools[0].requests = this.pools[0].requests + 1;
        this.pools[0].total = this.pools[0].total + 1;
        this.lastIndex = 0;
        this.nextIndex = 1;
        return { host: this.pools[0], index: idx };
    }

    this.weighted = weighted;
}

function loaderRandom(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    function random() {
        let min = 0, max = this.pools.length;
        min = Math.ceil(min);
        max = Math.floor(max);
        let idx = Math.floor(Math.random() * (max - min + 1)) + min;
        return { host: this.pools[idx], index: idx };
    }

    this.random = random;
}

function loaderSequential(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    function sequential() {
        if (this.nextIndex > max) {
            this.lastIndex = 0;
            this.nextIndex = this.lastIndex + 1;
        } else {
            this.lastIndex = this.nextIndex;
            this.nextIndex = this.lastIndex + 1;
        }
        return { host: this.pools[this.lastIndex], index: this.lastIndex };
    }

    this.sequential = sequential;
}


function loaderSingleMaxload(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    function singlemaxload() {
        if (this.pools[this.lastIndex].requests < this.pools[this.lastIndex].max) {
            this.pools[this.lastIndex].requests += 1;
            this.pools[this.lastIndex].total += 1;
            return { host: this.pools[this.lastIndex], index: this.lastIndex };
        } else if (this.pools[this.lastIndex].requests === this.pools[this.lastIndex].max) {
            this.lastIndex = this.nextIndex;
            this.nextIndex = this.lastIndex + 1;
            this.pools[this.lastIndex].requests = 0;
            this.pools[this.lastIndex].total += 1;
            return { host: this.pools[this.lastIndex], index: this.lastIndex };
        }
    }

    this.singlemaxload = singlemaxload;
}


function loaderSticky(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    function sticky() {
        // sticky === singlemaxload + index stickyness till end or exit of connection
        if (this.pools[this.lastIndex].requests < this.pools[this.lastIndex].max) {
            this.pools[this.lastIndex].requests += 1;
            this.pools[this.lastIndex].total += 1;
            this.pools[this.lastIndex]["stick"] = this.lastIndex;
            return { host: this.pools[this.lastIndex], index: this.lastIndex };
        } else if (this.pools[this.lastIndex].requests === this.pools[this.lastIndex].max) {
            this.lastIndex = this.nextIndex;
            this.nextIndex = this.lastIndex + 1;
            this.pools[this.lastIndex].requests = 0;
            this.pools[this.lastIndex].total += 1;
            this.pools[this.lastIndex]["stick"] = this.lastIndex;
            return { host: this.pools[this.lastIndex], index: this.lastIndex };
        }
    }

    this.sticky = sticky;
}

// loadingAlgorithms(["127.0.0.1:8000"]);


module.exports.loaderRandom = loaderRandom;
module.exports.loaderSequential = loaderSequential;
module.exports.loaderSingleMaxload = loaderSingleMaxload;
module.exports.loaderSticky = loaderSticky;
module.exports.loaderWeighted = loaderWeighted;

