

function Loadbalancer(serverOptions) {

    var serverOptions = serverOptions || {
        "server": null,
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
        // Consider: setupPrimary or runtime
        "runtime": {
            "type": "", // exec, execFile, fork, spawn, execFileSync, execSync, spawnSync
            "command": "",
            "args": {},
            "env": {},
            "options": {}
        },
        "mainProcessCallback": () => { },
        "forkCallback": (opts, pr) => { },
        "callbacks": {
            "wsOnData": null,
            "wsOnEnd": null,
            "wsUpgrade": null,
            "server": null,
            "listen": null
        },
        ...serverOptions
    }

    this.setServerOptions = (serverOptions) => {
        if (!serverOptions) return new Error("");
        serverOptions = serverOptions;
    }

    this.getServerOptions = (serverOptions) => {
        return serverOptions;
    }

    this.processes = () => new Error("");
    this.processingMulti = () => new Error("");
    this.cluster = () => new Error("");
    this.threading = () => new Error("");
    this.threadingMulti = () => new Error("");
    this.loadbalancer = () => new Error("");
}