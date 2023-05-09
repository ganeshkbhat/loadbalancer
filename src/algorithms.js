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

/**
 *
 *
 * @param {*} pools
 * @return {*} 
 */
function poolsInstance(pools) {
    this.pools = pools || [];
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

/**
 *
 *
 * @param {*} arr
 * @param {*} key
 * @param {string} [order="desc"]
 * @return {*} 
 */
function sortPoolsByKey(arr, key, order = "desc") {
    if (order === "desc") {
        arr.sort((a, b) => a[key] - b[key]);
    } else if (order === "asc") {
        arr.sort((a, b) => b[key] - a[key]);
    }
    return arr;
}

/**
 *
 *
 * @param {*} arr
 * @param {*} key
 * @param {*} key2
 * @param {string} [order="desc"]
 * @return {*} 
 */
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

/**
 *
 *
 * @param {*} pools
 * @param {*} index
 * @return {*} 
 */
function closeConnections(pools, index) {
    pools[index].open = pools[index].open - 1;
    pools[index].closed = pools[index].closed + 1;
    return pools;
}

/**
 *
 *
 * @return {*} 
 */
function weighted() {
    this.pools = sortPoolsByKeys(this.pools, "currentWeight", "weight", "desc");
    this.pools[0].open = this.pools[0].open + 1;
    this.pools[0].requests = this.pools[0].requests + 1;
    this.pools[0].total = this.pools[0].total + 1;
    this.lastIndex = 0;
    this.nextIndex = 1;
    // currentWeight > recalculate
    return { host: this.pools[0], index: idx };
}

/**
 *
 *
 * @return {*} 
 */
function random() {
    let min = 0, max = pools.length;
    min = Math.ceil(min);
    max = Math.floor(max);
    let idx = Math.floor(Math.random() * (max - min + 1)) + min;
    return { host: this.pools[idx], index: idx };
}

/**
 *
 *
 * @return {*} 
 */
function sequential() {
    if (this.nextIndex > this.max) {
        this.lastIndex = 0;
        this.nextIndex = this.lastIndex + 1;
    } else {
        this.lastIndex = this.nextIndex;
        this.nextIndex = this.lastIndex + 1;
    }
    return { host: this.pools[this.lastIndex], index: this.lastIndex };
}

/**
 *
 *
 * @return {*} 
 */
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

/**
 *
 *
 * @return {*} 
 */
function singlemaxload() {
    if (this.pools[this.lastIndex].requests < this.pools[this.lastIndex].max) {
        this.pools[this.lastIndex].requests += 1;
        this.pools[this.lastIndex].total += 1;
        return { host: this.pools[this.lastIndex], index: this.lastIndex };
    } else if (this.pools[this.lastIndex].requests === this.pools[this.lastIndex].max) {
        if (algorithm === "sequential") {
            this.lastIndex = this.nextIndex;
            this.nextIndex = this.lastIndex + 1;
        } else if (algorithm === "random") {

        } else if (algorithm === "weighted") {

        } else if (algorithm === "sticky") {

        }

        this.pools[this.lastIndex].requests = 0;
        this.pools[this.lastIndex].total += 1;
        return { host: this.pools[this.lastIndex], index: this.lastIndex };
    }
}

/**
 *
 *
 * @param {*} pools
 */
function Weighted(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.pools = sortPoolsByKey(this.pools, "weight", "desc");

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 1;

    this.weighted = function () { return weighted() }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 */
function Random(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0; // not needed

    this.random = function () { return random() }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 */
function Sequential(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.pools = sortPoolsByKey(this.pools, "weight", "desc");

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 1;

    this.sequential = function () { return sequential() }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 */
function Sticky(pools) {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.pools = sortPoolsByKey(this.pools, "weight", "desc");

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    this.sticky = function () { return sticky() }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 * @param {string} [algorithm="sequential"] Options: sequential, random, weighted, sticky
 */
function SingleMaxload(pools, algorithm = "sequential") {
    Object.assign(this, poolsInstance(pools));

    this.min = 0;
    this.max = this.pools.length;

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 1;


    this.singlemaxload = function () { return singlemaxload() }.bind(this, algorithm);
}


module.exports.poolsInstance = poolsInstance;
module.exports.sortPoolsByKeys = sortPoolsByKeys;
module.exports.sortPoolsByKey = sortPoolsByKey;
module.exports.closeConnections = closeConnections;


module.exports.random = random;
module.exports.sequential = sequential;
module.exports.sticky = sticky;
module.exports.seighted = weighted;
module.exports.singleMaxload = singleMaxload;


module.exports.Random = Random;
module.exports.Sequential = Sequential;
module.exports.Sticky = Sticky;
module.exports.Weighted = Weighted;
module.exports.SingleMaxload = SingleMaxload;

