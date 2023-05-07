
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


function loader(pools) {
    Object.assign(this, poolsInstance(pools));
    this.count = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;

    function sortPools(weight = "desc") {

    }

    function closeConnections(index) {

    }

    function weighted() {

    }

    function sequential() {

    }

    function random() {
        let idx = Math.round(Math.random() * 10);
        return { host: this.pools[idx], index: idx };
    }

    function singlemaxload() {
        if (this.pools[this.lastIndex].requests < this.pools[this.lastIndex].max) {
            this.pools[this.lastIndex].requests = this.pools[this.lastIndex].requests + 1;
            this.pools[this.lastIndex].total = this.pools[this.lastIndex].total + 1;
            return { host: this.pools[this.lastIndex], index: this.lastIndex };
        } else if (this.pools[this.lastIndex].requests === this.pools[this.lastIndex].max) {
            this.lastIndex = this.nextIndex;
            this.nextIndex = this.lastIndex + 1;
            this.pools[this.lastIndex].requests = 0;
            this.pools[this.lastIndex].total = this.pools[this.lastIndex].total + 1;
            return { host: this.pools[this.lastIndex], index: this.lastIndex };
        }
    }

    function sticky() {
        // sticky === singlemaxload + index stickyness till end or exit of connection
    }

    return {
        weighted,
        sequential,
        random,
        singlemaxload,
        sticky
    }
}

loadingAlgorithms(["127.0.0.1:8000"]);

