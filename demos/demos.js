
var lb = require("../index");



lb.loadbalancer(10, {
    protocol: "",
    host: "localhost",
    proxy: false,
    port: 8080,
    ws: true,
    mainProcessCallback: (opts) => { },
    forkCallback: function (opts) {
        console.log(arguments[1]);
        require("../demos/server.js");
    }
})


// if (!serverOptions.proxy) {
//     require('./server').server(serverOptions, mainThreadCallback);
// } else {
//     require('./server').proxy(serverOptions, (!!app_server_callback) ? app_server_callback : undefined);
// }

