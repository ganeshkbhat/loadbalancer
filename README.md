# loadbalancer

A simple threaded and clustered load balancer for nodejs with different forwarding algorithms and server request handling options. 


## DEMOS

Find the demos in the [demo folder](https://github.com/ganeshkbhat/loadbalancer/tree/main/demos)


## FEATURES

The following features are inbuilt into the loadbalancer:
- [] Main Features 
    - [] Multi Processing and Multi Threading with Algorithm based routing
    - [] Detailed Support based on development
- [] Loadbalanced Server (Multi Protocol Support)
- [] Loadbalanced Client (Multi Protocol Support)


## .loadbalancer module

There are three modules in the loadbalancer module: `loadbalancer (clustered processes)`, `threadingMultiple`, `threading`


## .loadbalancer module

`loadbalancer`

```


```


## .loadbalancer cluster module


`cluster`

```

var cluster = require("loadbalancerjs").cluster;
var httpSocketServer = require("loadbalancerjs").sockets.httpSocketServer;
var server = require("./express-app");

cluster({
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


## .loadbalancer processing module

`processing`

```

```

## .loadbalancer multi processing module

`processingMultiple`

```

```

## .loadbalancer threading module

`threading`

```

```


## .loadbalancer multi threading module

`threadingMultiple`

```

```



<!-- 
## .serverutils module

server, reverseProxy, createNetProxy, websocket_secure, websocket, sqlKvStore -->

## .algorithms module

The following algorithms are supported: `randomize, sequential, sticky, weighted, singlemaxload`

- `Randomize`, 
- `Sequential`, 
- `Sticky`, 
- `Weighted`, 
- `SingleMaxload`


## .certificates module

Generate the Public and Private keys function: `generateCertificates`

`generateCertificates()`

## Architechure



<!--

require("loadbalancer") => process cluster => child worker thread =>

-->
