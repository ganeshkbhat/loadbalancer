
var lb = require("../index").loadbalancer.loadbalancer;

lb.loadbalancer(10, {
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
    "keys": {
        "key": "./certs/ssl.key",
        "cert": "./certs/ssl.cert"
    },
    "port": 8080,
    "ws": true,
    "processes": 5,
    "threads": 10,
    mainProcessCallback: (opts) => { },
    forkCallback: function (opts) {
        console.log(arguments[1]);
        require("../demos/server.js");
    },
    "callbacks": { 
        "server": null, 
        "listen": null 
    }
})


// if (!serverOptions.proxy) {
//     require('./server').server(serverOptions, mainThreadCallback);
// } else {
//     require('./server').proxy(serverOptions, (!!app_server_callback) ? app_server_callback : undefined);
// }

