# node-vault-sync

Generate configuration object from HashiCorp Vault by automatic authenticating with ***locally cached token*** or ***kubernetes*** service account in pod environment.

## 1. About
- This module is built for removal of Secret and ConfigMap mount for applications in kubernetes to pursue identical way between local development and remote deployment in kubernetes. 
- This module exports a single function to create an JavaScript Object (or any type).
- The function works in synchronous way by mimicking RPC call for asynchronous HTTP requests. It is a bad practice, but this is for the synchronous configuration loading at bootstrap.
- How it works:
    - At first, It will try to use locally cached token (`~/.vault-token`).
    - If there is no cached token, it will try to auth to vault with kubernetes service account token (`/var/run/secrets/kubernetes.io/serviceaccount/token`).
    - If there is no kubernetes service account token, it will throw an error.
    - If got error while reading secrets it will throw the original error.
    - It will always try to parse fetched data as JSON, even if failed it will not throw any error.

## 2. Usage
#### Install
```bash
$ npm i --save qmit-pro/node-vault-sync
```

#### ./config.js
```js
const vault = require("node-vault-sync");

module.exports = vault(get => {
    return {
        app: get("secret/app"),
        db: get("database/app"),
        foo: {
            text: get("secret/some-text"),
            foo: "other-property",
            bar: [1,2,3],
        },
        bar() {
            // ...
        },
    };
}, {
    // vault connection setting
    uri: "http://server.vault.svc.cluster.local",
    role: "default", // /auth/kubernetes/role/:role
});
```

#### ./index.js
```js
const config = require("./config");

// Work with config
console.log(config);
```

## 3. Development
### Test
Currently it dose not provide mocking environment for Vault and Kubernetes.
Configure your vault environment and use telepresence for k8s to test.
```
npm test
```
