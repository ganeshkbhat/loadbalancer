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
    }.bind(this);

    this.pools = (!!pools) ? this.addPools(pools) : [];

    this.len = () => this.pools.length;
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
 * @param {*} pools
 * @param {*} lastIndex
 * @param {*} nextIndex
 * @return {*} 
 */
function weighted(pools, lastIndex, nextIndex) {
    pools = sortPoolsByKeys(pools, "currentWeight", "weight", "desc");
    pools[0].open = pools[0].open + 1;
    pools[0].requests = pools[0].requests + 1;
    pools[0].total = pools[0].total + 1;
    lastIndex = 0;
    nextIndex = 1;
    // currentWeight > recalculate
    return { result: { host: pools[0], index: 0 }, lastIndex: lastIndex, nextIndex: nextIndex };
}

/**
 *
 *
 * @param {*} pools
 * @param {*} lastIndex
 * @param {*} nextIndex
 * @return {*} 
 */
function randomize(pools, lastIndex, nextIndex) {
    let min = 0, max = pools.length;
    min = Math.ceil(min);
    max = Math.floor(max);
    let idx = Math.floor(Math.random() * (max - min + 1)) + min;
    return { result: { host: pools[idx], index: idx }, lastIndex: idx, nextIndex: nextIndex };
}

/**
 *
 *
 * @param {*} pools
 * @param {*} lastIndex
 * @param {*} nextIndex
 * @param {*} max
 * @return {*} 
 */
function sequential(pools, lastIndex, nextIndex, max) {
    if (nextIndex > max) {
        lastIndex = 0;
        nextIndex = lastIndex + 1;
    } else {
        lastIndex = nextIndex;
        nextIndex = lastIndex + 1;
    }
    return { result: { host: pools[lastIndex], index: lastIndex }, lastIndex: lastIndex, nextIndex: nextIndex };
}

/**
 *
 *
 * @param {*} pools
 * @param {*} lastIndex
 * @param {*} nextIndex
 * @return {*} 
 */
function sticky(pools, lastIndex, nextIndex) {
    const uuid = require("uuid");
    // sticky === singlemaxload + index stickyness till end or exit of connection
    if (pools[lastIndex].requests < pools[lastIndex].max) {
        pools[lastIndex].requests += 1;
        pools[lastIndex].total += 1;
        let messageId = uuid.uuidv5();
        pools[lastIndex]["stick"] = messageId;
        console.log("messageId: ", messageId);
        return { result: { host: pools[lastIndex], index: lastIndex }, lastIndex: lastIndex, nextIndex: nextIndex };
    } else if (pools[lastIndex].requests === pools[lastIndex].max) {
        lastIndex = nextIndex;
        nextIndex = lastIndex + 1;
        pools[lastIndex].requests = 0;
        pools[lastIndex].total += 1;
        let messageId = uuid.uuidv5();
        console.log("messageId: ", messageId);
        pools[lastIndex]["stick"] = messageId;
        return { result: { host: pools[lastIndex], index: lastIndex }, lastIndex: lastIndex, nextIndex: nextIndex };
    }
}

/**
 *
 *
 * @param {*} pools
 * @param {*} lastIndex
 * @param {*} nextIndex
 * @param {string} [algorithm="sequential"]
 * @return {*} 
 */
function singlemaxload(pools, lastIndex, nextIndex, algorithm = "sequential") {
    if (pools[lastIndex].requests < pools[lastIndex].max) {
        pools[lastIndex].requests += 1;
        pools[lastIndex].total += 1;
        return { result: { host: pools[lastIndex], index: lastIndex }, lastIndex: lastIndex, nextIndex: nextIndex };
    } else if (pools[lastIndex].requests === pools[lastIndex].max) {
        if (algorithm === "sequential") {
            // lastIndex = nextIndex;
            // nextIndex = lastIndex + 1;
            results = sequential(pools, lastIndex, nextIndex, pools[lastIndex].max);
        } else if (algorithm === "randomize") {
            results = randomize(pools, lastIndex, nextIndex);
        } else if (algorithm === "weighted") {
            results = weighted(pools, lastIndex, nextIndex);
        } else if (algorithm === "sticky") {
            results = sticky(pools, lastIndex, nextIndex);
        }

        pools[lastIndex].requests = 0;
        pools[lastIndex].total += 1;
        return { result: results.result, lastIndex: results.lastIndex, nextIndex: results.nextIndex };
    }
}

/**
 *
 *
 * @param {*} pools
 */
function Weighted(pools) {
    poolsInstance.call(this);
    this.addPools(pools);
    this.pools = sortPoolsByKey(this.pools, "weight", "desc");

    this.min = 0;
    this.max = this.len(this.pools);

    this.count = 0;
    this.lastIndex = -1;
    this.nextIndex = 0;

    this.weighted = function () {
        let { result, lastIndex, nextIndex } = weighted(this.pools, this.lastIndex, this.nextIndex);
        this.lastIndex = lastIndex;
        this.nextIndex = nextIndex;
        return result;
    }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 */
function Randomize(pools) {
    poolsInstance.call(this);
    this.addPools(pools);

    this.min = 0;
    this.max = this.len();

    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 1; // not needed

    this.randomize = function () {
        let { result, lastIndex, nextIndex } = randomize(this.pools, this.lastIndex, this.nextIndex);
        this.lastIndex = lastIndex;
        this.nextIndex = nextIndex;
        return result;
    }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 */
function Sequential(pools) {
    poolsInstance.call(this);
    this.addPools(pools);

    this.min = 0;
    this.max = this.len();

    this.pools = sortPoolsByKey(this.pools, "weight", "desc");

    this.count = 0;
    this.lastIndex = -1;
    this.nextIndex = 0;

    this.sequential = function () {
        let { result, lastIndex, nextIndex } = sequential(this.pools, this.lastIndex, this.nextIndex, this.max);
        this.lastIndex = lastIndex;
        this.nextIndex = nextIndex;
        return result;
    }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 */
function Sticky(pools) {
    poolsInstance.call(this);
    this.addPools(pools);

    this.min = 0;
    this.max = this.len();

    this.pools = sortPoolsByKey(this.pools, "weight", "desc");

    this.count = 0;
    this.lastIndex = -1;
    this.nextIndex = 0;

    this.sticky = function () {
        let { result, lastIndex, nextIndex } = sticky(this.pools, this.lastIndex, this.nextIndex);
        this.lastIndex = lastIndex;
        this.nextIndex = nextIndex;
        return result;
    }.bind(this);
}

/**
 *
 *
 * @param {*} pools
 * @param {string} [algorithm="sequential"] Options: sequential, randomize, weighted, sticky
 */
function SingleMaxload(pools, algorithm = "sequential") {
    poolsInstance.call(this, pools);
    this.addPools(pools);

    this.min = 0;
    this.max = this.len();

    this.count = 0;
    this.lastIndex = -1;
    this.nextIndex = 0;

    this.singlemaxload = function () {
        let { result, lastIndex, nextIndex } = singlemaxload(this.pools, this.lastIndex, this.nextIndex);
        this.lastIndex = lastIndex;
        this.nextIndex = nextIndex;
        return result;
    }.bind(this, algorithm);
}


module.exports.poolsInstance = poolsInstance;
module.exports.sortPoolsByKeys = sortPoolsByKeys;
module.exports.sortPoolsByKey = sortPoolsByKey;
module.exports.closeConnections = closeConnections;


module.exports.randomize = randomize;
module.exports.sequential = sequential;
module.exports.sticky = sticky;
module.exports.weighted = weighted;
module.exports.singlemaxload = singlemaxload;


module.exports.Randomize = Randomize;
module.exports.Sequential = Sequential;
module.exports.Sticky = Sticky;
module.exports.Weighted = Weighted;
module.exports.SingleMaxload = SingleMaxload;

