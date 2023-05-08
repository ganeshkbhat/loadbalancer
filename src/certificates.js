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

/**
 *
 *
 * @param {*} folderpath
 * @return {*} 
 */
function generateCertificates(folderpath) {

    return {
        publicKey,
        privateKey
    }
}

module.exports.generateCertificates = generateCertificates;
