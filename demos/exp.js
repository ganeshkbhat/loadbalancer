/**
 * 
 * Package: loadbalancer
 * Author: Ganesh B
 * Description: A simple threaded and clustered load balancer for nodejs
 * Install: npm i loadbalancer --save
 * Github: https://github.com/ganeshkbhat/loadbalancer
 * npmjs Link: https://www.npmjs.com/package/loadbalancer
 * File: index.js
 * File Description: A simple threaded and clustered load balancer for nodejs
 * 
 * 
*/

/* eslint no-console: 0 */

'use strict';

var express = require("express");
let app = express();

app.use(function (req, res, next) {
    next()
})

app.get("/", function (req, res) {
    res.status(200).send({ "test": "tester" })
})

app.all("/test", function (req, res) {
    res.status(200).send({ "test": "tester" })
})

app.get("/tester", function (req, res, next) { next() }, function (req, res) {
    res.status(200).send({ "test": "tester" })
})

// console.log(app._router.stack);

/**
 * 
 * @param {*} path 
 * @param {*} method 
 * @param {*} app 
 * @returns 
 */
function getHandlers(path, method, _this) {
    let app = _this || this;
    for (let i = 0; i < app._router.stack.length; i++) {
        // console.log(app._router.stack[i]);
        if (app._router.stack[i].route) {
            if (app._router.stack[i].route.path === path) {
                for (let j = 0; j < app._router.stack[i].route.stack.length; j++) {
                    if (method === "all") {
                        return app._router.stack[i].route.stack;
                    }
                    if (app._router.stack[i].route.stack[j].method === method) {
                        // console.log(app._router.stack[i].route.stack[j]);
                        // console.log(app._router.stack[i].route.stack[j].handle);
                        return [app._router.stack[i].route.stack[j]];
                    }
                }
            }
        }
    }
}

function getHandler(path, method, _this) {
    let app = _this || this;
    for (let i = 0; i < app._router.stack.length; i++) {
        // console.log(app._router.stack[i]);

        if (!!app._router.stack[i].route) {
            if (app._router.stack[i].route.path === path) {
                for (let j = 0; j < app._router.stack[i].route.stack.length; j++) {
                    if (app._router.stack[i].route.stack[j].method === method) {
                        // console.log(app._router.stack[i].route.stack[j]);
                        // console.log(app._router.stack[i].route.stack[j].handle);
                        return app._router.stack[i].route.stack[j];
                    }
                }
            }
        }
    }
}

function getHandlerWithMiddlewares(path, method, _this) {
    let app = _this || this;
    let handlers = [];
    for (let i = 0; i < app._router.stack.length; i++) {
        // console.log(app._router.stack[i]);
        if (!app._router.stack[i].route) {
            handlers.push(app._router.stack[i]);
        }
        if (!!app._router.stack[i].route) {
            if (app._router.stack[i].route.path === path) {
                for (let j = 0; j < app._router.stack[i].route.stack.length; j++) {
                    if (app._router.stack[i].route.stack[j].method === method || method === "all") {
                        // console.log(app._router.stack[i].route.stack[j]);
                        // console.log(app._router.stack[i].route.stack[j].handle);
                        handlers.push(app._router.stack[i].route.stack[j]);
                        
                    }
                }
            }
        }
    }
    return handlers;
}

function extendExpress(app) {
    app["getHandler"] = getHandler;
    app["getHandlers"] = getHandlers;
    app["getHandlerWithMiddlewares"] = getHandlerWithMiddlewares;
    return app;
}


// app = extendExpress(app);
// console.log(app.getHandlerWithMiddlewares("/test", "all")[0].handle());

// app.listen(3000, () => {
//     console.log("Running server at 3000");
// });

