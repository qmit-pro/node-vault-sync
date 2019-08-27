const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const VAULT_TOKEN_PATH = path.join(process.env.HOME, ".vault-token");
const K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";
const K8S_API_HOST = "https://kubernetes.default.svc.cluter.local";


async function makeAsync(factory = (get) => {}, opts = {}) {// for jest bug
    // validate arguments
    if (typeof factory != "function") throw new Error("First argument should be a factory function which returns configuration value");
    if (typeof opts != "object") throw new Error("Second argument should be a object for Vault connection option");
    opts = {
        uri: "http://server.vault.svc.cluster.local",
        role: "default",
        debug: false,
        ...opts,
    };

    // get local token
    let vaultToken;
    if (hasVaultToken()) {
        vaultToken = readVaultToken();
        opts.debug && console.log("read local vault token:", vaultToken);
    } else if (hasKubenetesSAToken()) {
        const k8sSAToken = readKubenetesSAToken();
        const result = await fetch(opts.uri + "/v1/auth/kubernetes/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ jwt: k8sSAToken, role: opts.role, }),
        })
            .then(res => res.json());

        opts.debug && console.log("read Kubernetes SA token:", k8sSAToken);
        console.log(result);
    }

    // return fetch(opts.uri)
    //     .then(res => res.text())
    //     .then(res => console.log(res));

    // for jest bug
    opts.debug && console.log("\n\n\n\n\n\n\n\n\n\n");
}

function hasVaultToken() {
    return fs.existsSync(VAULT_TOKEN_PATH);
}

function readVaultToken() {
    return fs.readFileSync(VAULT_TOKEN_PATH).toString();
}

function hasKubenetesSAToken() {
    return fs.existsSync(K8S_SA_TOKEN_PATH);
}

function readKubenetesSAToken() {
    return fs.readFileSync(K8S_SA_TOKEN_PATH).toString();
}

module.exports = makeAsync;
