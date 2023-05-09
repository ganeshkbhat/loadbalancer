# loadbalancer

A simple threaded and clustered load balancer for nodejs with different forwarding algorithms and server request handling options. 



### DEMOS

Find the demos in the [demo folder](https://github.com/ganeshkbhat/loadbalancer/tree/main/demos)



### .loadbalancer module

loadbalancer (clustered processes), threadingMultiple, threading

### .serverutils module

server, reverseProxy, websocket_secure, websocket, createNetProxy, sqlKvStore

### .algorithms module

randomize, sequential, sticky, weighted, singlemaxload

Randomize, Sequential, Sticky, Weighted, SingleMaxload

### .certificates module

generateCertificates

### Architechure



<!--

require("loadbalancer") => process cluster => child worker thread =>

-->
