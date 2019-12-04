import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// @ts-ignore
const VAULT_TOKEN_PATH = path.join(process.env.HOME, ".vault-token");
const K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";

export default async function vaultAsync<T>(factory: VaultReaderFactory<T>, opts: VaultReaderOptions) {
  // validate arguments
  if (typeof factory != "function") {
    throw new Error("First argument should be a factory function which returns configuration value");
  } else if (typeof opts != "object") {
    throw new Error("Second argument should be a object for Vault connection option");
  }

  const reader = new VaultReader(opts);
  return await reader.generateWithFactory(factory);
}

export type VaultReaderOptions = {
  uri: string
  method: string
  role: string
  debug?: boolean
  ignoreLocalToken?: boolean
  ignoreK8sSAToken?: boolean
};

export type VaultReaderFactory<T = any> = (get: (itemPath: string) => Promise<any>, list: (itemPath: string) => Promise<any>) => Promise<T>;

class VaultError extends Error {
  private code: number;

  constructor(props: any, code: number) {
    super(props);
    this.code = code;
  }
}

class VaultReader {
  private opts: VaultReaderOptions;
  private token: string | null;

  constructor(opts: VaultReaderOptions) {
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
    if (this.token) {
      return;
    }

    const {uri, method, role, debug, ignoreLocalToken, ignoreK8sSAToken} = this.opts;
    let vaultToken = null;

    if (!ignoreLocalToken && fs.existsSync(VAULT_TOKEN_PATH)) {
      vaultToken = fs.readFileSync(VAULT_TOKEN_PATH).toString();
      debug && console.log("read local vault token:", vaultToken);

    } else if (!ignoreK8sSAToken && fs.existsSync(K8S_SA_TOKEN_PATH)) {
      const jwt = fs.readFileSync(K8S_SA_TOKEN_PATH).toString();
      debug && console.log("read k8s sa token:", jwt);

      vaultToken = await fetch(`${uri}/v1/auth/${method}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({jwt, role}),
      })
        .then(res => res.json())
        .then(res => {
          if (res.errors) {
            const error = new Error("invalid vault token: " + res.errors.join("\n"));
            throw error;
          }
          debug && console.log("vault auth response:", res);
          return res.auth.client_token;
        });

      debug && console.log("issued vault token with k8s sa token:", vaultToken);
    } else {
      throw new VaultError("Failed to read both vault token and k8s service account token", 401);
    }

    this.token = vaultToken;
  }

  async generateWithFactory<T = any>(factory: VaultReaderFactory<T>) {
    return factory(this.read.bind(this), this.list.bind(this));
  }

  async call(itemPath: string, method: string) {
    const {uri} = this.opts;
    const itemURI = `${uri}/v1/${itemPath}`;

    await this.getToken(); // lazy login

    // @ts-ignore
    return fetch(itemURI, {
      method,
      headers: {"X-Vault-Token": this.token},
    })
      .then(async (res: any) => {
        const result = await res.json();
        if (res.status >= 400) {
          const err = new VaultError("Failed to fetch: " + itemURI, res.status);
          throw Object.assign(err, result);
        }
        return result.data;
      });
  }

  async read(itemPath: string) {
    return this.call(itemPath, "GET");
  }

  async list(itemPath: string) {
    return this.call(itemPath, "LIST");
  }
}
