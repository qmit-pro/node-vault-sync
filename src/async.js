const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const VAULT_TOKEN_PATH = path.join(process.env.HOME, ".vault-token");
const K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";

async function makeAsync(factory = (read) => {}, opts = {}) {// for jest bug
    // validate arguments
    if (typeof factory != "function") throw new Error("First argument should be a factory function which returns configuration value");
    if (typeof opts != "object") throw new Error("Second argument should be a object for Vault connection option");

    const reader = new VaultReader(opts);
    return await reader.readWithFactory(factory);
}

class VaultReader {
    constructor(opts = {}) {
        this.opts = {
            uri: "https://server.vault.svc.cluster.local",
            method: "kubernetes",
            role: "default",
            debug: false,
            ignoreLocalToken: false,
            ...opts,
        };
        this.token = null;
    }

    async getToken() {
        const { uri, method, role, debug, ignoreLocalToken } = this.opts;
        let vaultToken;

        if (!ignoreLocalToken && fs.existsSync(VAULT_TOKEN_PATH)) {
            vaultToken = fs.readFileSync(VAULT_TOKEN_PATH).toString();
            debug && console.log("read local vault token:", vaultToken);

        } else if (fs.existsSync(K8S_SA_TOKEN_PATH)) {
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
        }

        this.token = vaultToken;
    }

    async readWithFactory(factory = (read) => {}) {
        return await factory(this.read.bind(this));
    }

    async read(itemPath) {
        const { uri, debug } = this.opts;
        const itemURI = `${uri}/v1/${itemPath}`;

        if (!this.token) await this.getToken(); // lazy login

        return await fetch(itemURI, {
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
