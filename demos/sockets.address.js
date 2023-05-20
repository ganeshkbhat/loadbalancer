/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: demos/sockets.address.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var SocketAddress = require("../index").sockets.socketAddress;

let sa = new SocketAddress({ address: "127.0.0.1" });

console.log(sa.address);
console.log(sa.family);
console.log(sa.flowlabel);
console.log(sa.port);

