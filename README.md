# loadbalancer
A simple threaded and clustered load balancer for nodejs


### Architechure

require("loadbalancer") => process cluster => child worker thread => 