/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: certificates.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var hashapis = require("hasher-apis");
var path = require("path");

/**
 *
 *
 * @param {*} folderpath
 * @return {*} 
 * 
 */
function generateCertificates(folderpath) {
    var fs = require("fs");
    var hash = require("hasher-apis");
    var { privateKey, publicKey } = hash._genKeyPair();

    // var xPVpem = privateKey.export({type: "pkcs1",  format: "pem"});
    // fs.writeFileSync("./demos/privateKey.pem", xPVpem)

    // var xPBpem = publicKey.export({type: "pkcs1",  format: "pem"});
    // fs.writeFileSync("./demos/publicKey.pem", xPBpem)

    hash._dumpKeyFile(path.join(folderpath, "./privateKey"), privateKey);
    hash._dumpKeyFile(path.join(folderpath, "./publicKey"), publicKey);

    return {
        publicKey,
        privateKey
    }
}

module.exports.generateCertificates = generateCertificates;
