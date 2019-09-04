const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const VAULT_TOKEN_PATH = path.join(process.env.HOME, ".vault-token");
const K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";

async function makeAsync(factory, opts) {// for jest bug
    // validate arguments
    if (typeof factory != "function") throw new Error("First argument should be a factory function which returns configuration value");
    else if (typeof opts != "object") throw new Error("Second argument should be a object for Vault connection option");

    const reader = new VaultReader(opts);
    return await reader.readWithFactory(factory);
}

class VaultReader {
    constructor(opts) {
        this.opts = {
            uri: "https://server.vault.svc.cluster.local",
            method: "kubernetes",
            role: "default",
            debug: false,
            ignoreLocalToken: false,
            ignoreK8sSAToken: false,
            ...opts,
        };
        this.token = null;
    }

    async getToken() {
        if (this.token) return;

        const { uri, method, role, debug, ignoreLocalToken, ignoreK8sSAToken } = this.opts;
        let vaultToken = null;

        if (!ignoreLocalToken && fs.existsSync(VAULT_TOKEN_PATH)) {
            vaultToken = fs.readFileSync(VAULT_TOKEN_PATH).toString();
            debug && console.log("read local vault token:", vaultToken);

        } else if (!ignoreK8sSAToken && fs.existsSync(K8S_SA_TOKEN_PATH)) {
            const k8sSAToken = fs.readFileSync(K8S_SA_TOKEN_PATH).toString();
            debug && console.log("read k8s sa token:", k8sSAToken);

            vaultToken = await fetch(`${uri}/v1/auth/${method}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ jwt: k8sSAToken, role, }),
            })
                .then(res => res.json())
                .then(req => req.auth.client_token);

            debug && console.log("issued vault token with k8s sa token:", vaultToken);
        } else {
            throw new Error("Failed to read both vault token and k8s service account token");
        }

        this.token = vaultToken;
    }

    async readWithFactory(factory) {
        return await factory(this.read.bind(this));
    }

    async read(itemPath) {
        const { uri } = this.opts;
        const itemURI = `${uri}/v1/${itemPath}`;

        await this.getToken(); // lazy login

        return fetch(itemURI, {
            method: "GET",
            headers: { "X-Vault-Token": this.token },
        })
            .then(async res => {
                const result = await res.json();
                if (res.status >= 400) {
                    const err = new Error(res.status + " Failed to fetch: " + itemURI);
                    throw Object.assign(err, result);
                }
                return result.data;
            });
    }
}

module.exports = makeAsync;
