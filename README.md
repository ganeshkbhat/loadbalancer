# loadbalancer

A simple threaded and clustered load balancer for nodejs with different forwarding algorithms and server request handling options. 



### DEMOS


Find the demos in the [demo folder](https://github.com/ganeshkbhat/loadbalancer/tree/main/demos)


### FEATURES


Supports creating server using the following protocols:

- HTTP, HTTPS
- TCP
- TLS
- UDP
- FTP
- SFTP
- Unix Socket 
- SocksV3, SocksV4, SocksV5


Supports creating client agents using the following protocols:

- HTTP, HTTPS
- TCP
- TLS
- UDP
- FTP
- SFTP
- Unix Socket 
- SocksV3, SocksV4, SocksV5



### .loadbalancer module

loadbalancer (clustered processes), threadingMultiple, threading

```
var loadbalancer = require("../index").loadbalancer;
var httpSocketServer = require("../index").sockets.httpSocketServer;
var server = require("./express-app");

loadbalancer({
    "server": server,
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
    "mainProcessCallback": () => { },
    "forkCallback": (opts, pr) => {
        // console.log(opts, pr);
        // console.log(opts);
        httpSocketServer(opts);
    },
    "callbacks": {
        "wsOnData": null,
        "wsOnEnd": null,
        "wsUpgrade": null,
        "server": null,
        "listen": null
    }
})


```

threadingMultiple

```

```

threading

```

```


### .serverutils module

server, reverseProxy, createNetProxy, websocket_secure, websocket, sqlKvStore

### .algorithms module

randomize, sequential, sticky, weighted, singlemaxload

Randomize, Sequential, Sticky, Weighted, SingleMaxload

### .certificates module

generateCertificates

### Architechure



<!--

require("loadbalancer") => process cluster => child worker thread =>

-->
