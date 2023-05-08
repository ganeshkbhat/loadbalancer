
var loadbalancer = require("../index").loadbalancer;
var server = require("../index").serverutils.server;

loadbalancer.loadbalancer({
    "server": null,
    "protocol": "http",
    "createCerts": true,
    "host": "localhost",
    "proxy": {
        "proxy": true,
        "target": "localhost",
        "host": 7000
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
        server(opts);
    }
})


