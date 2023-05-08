
var loadbalancer = require("../index").loadbalancer;
var reverseProxy = require("../index").serverutils.reverseProxy;
var server = require("./server");

loadbalancer.loadbalancer({
    "server": server,
    "protocol": "http",
    "createCerts": true,
    "host": "localhost",
    "proxy": {
        "proxy": true,
        "target": "localhost",
        "host": 7000
    },
    "keys": {
        "key": './certs/ssl.key',
        "cert": './certs/ssl.cert'
    },
    "port": 8080,
    "ws": true,
    "processes": 5,
    "threads": 10,
    "mainProcessCallback": () => {

    },
    "forkCallback": (opts, pr) => {
        // console.log(opts, pr);
        // console.log(opts);
        reverseProxy(opts);
    }
})


