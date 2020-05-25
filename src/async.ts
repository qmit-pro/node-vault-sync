import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const VAULT_TOKEN_PATH = path.join(process.env.HOME!, ".vault-token");
export const K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";

export default function vaultAsync<T, S>(factory: VaultReaderFactory<T, S>, opts: VaultReaderOptions<S>): Promise<T> {
  // validate arguments
  if (typeof factory != "function") {
    throw new Error("First argument should be a factory function which returns configuration value");
  } else if (typeof opts != "object") {
    throw new Error("Second argument should be a object for Vault connection option");
  }

  const reader = new VaultReader<S>(opts);
  return reader.generateWithFactory(factory);
}

export type VaultReaderOptions<S extends {[key: string]: any} | undefined = undefined> = {
  uri: string
  method: string
  role: string
  debug?: boolean
  ignoreLocalToken?: boolean
  ignoreK8sSAToken?: boolean
  sandbox?: S;
};

export type VaultReaderFactory<T = any, S = any> = (get: (itemPath: string) => Promise<any>, list: (itemPath: string) => Promise<any>, sandbox?: S) => Promise<T>;

export class VaultError extends Error {
  private code: number;

  constructor(props: any, code: number) {
    super(props);
    this.code = code;
  }
}

export class VaultReader<S> {
  private readonly opts: VaultReaderOptions<S>;
  private token: string | null;

  constructor(opts: VaultReaderOptions<S>) {
    this.opts = {
      uri: "https://server.vault.svc.cluster.local",
      method: "kubernetes",
      role: "default",
      debug: false,
      ignoreLocalToken: false,
      ignoreK8sSAToken: false,
    };
    this.opts = { ...this.opts, ...opts };
    this.token = null;
  }

  async getToken() {
    if (this.token) {
      return;
    }

    const {uri, method, role, debug, ignoreLocalToken, ignoreK8sSAToken} = this.opts;
    let vaultToken: string;

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

    this.token = vaultToken || null;
  }

  async generateWithFactory<T = any>(factory: VaultReaderFactory<T, S>) {
    return factory(this.read.bind(this), this.list.bind(this), this.opts.sandbox);
  }

  async call(itemPath: string, method: string) {
    const {uri} = this.opts;
    const itemURI = `${uri}/v1/${itemPath}`;

    await this.getToken(); // lazy login

    // @ts-ignore
    return fetch(itemURI, {
      method,
      headers: {"X-Vault-Token": this.token || "" },
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
