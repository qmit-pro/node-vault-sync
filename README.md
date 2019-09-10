# node-vault-sync

Generate configuration object ***synchronously*** from HashiCorp Vault by automatic authenticating with ***locally cached token*** or ***kubernetes*** service account in pod environment.

![coverage-lines](./coverage/badge-lines.svg)
![coverage-statements](./coverage/badge-statements.svg)
![coverage-functions](./coverage/badge-functions.svg)
![coverage-branches](./coverage/badge-branches.svg)

## 1. About
- This module is built to pursue identical configuration way between local development and remote deployment in kubernetes. 
- This module exports a single function to create an JavaScript Object (or any type).
- The function works in synchronous way by mimicking RPC call for asynchronous HTTP requests. It is a bad practice, but this is for the synchronous configuration loading at bootstrap.
- How it works:
    - At first, It will try to use locally cached token (`~/.vault-token`).
    - If there is no cached token, it will try to auth to vault with kubernetes service account token (`/var/run/secrets/kubernetes.io/serviceaccount/token`).
    - If there is no kubernetes service account token, it will throw an error.
    - If got error while reading secrets it will throw the original error.
- Requirements:
    - vault server with kubernetes auth method enabled.

## 2. Usage
#### Install

##### npm
```bash
$ npm i --save node-vault-sync
```

##### nightly build
```bash
$ npm i --save qmit-pro/node-vault-sync
```


#### ./sync-config.js
```js
const vault = require("node-vault-sync");

module.exports = vault(async (get, list) => {
    return {
        app: (await get("secret/data/test")).data.hello,
        keys: (await list("secret/metadata")).keys,
        foo: {
            db: (await get("database/mysql/test")),
            foo: "other-property",
            bar: [1,2,3],
        },
    };
}, {
    // vault connection setting
    uri: "https://server.vault.svc.cluster.local",
    debug: false,
    
    // alternative auth method for kubernetes pod
    method: "kubernetes",
    role: "default",
});
```

#### ./sync-example.js
```js
const config = require("./sync-config");

// Work with config
console.log(config);
```

#### ./async-config-example.js
```js
const vault = require("node-vault-sync");

// rather do asynchronously
vault.async(async get => { ... }, { ... })
    .then(config => {
        console.log(config);
    })
```


## 3. Development
### Test
Currently it dose not provide mocking environment for Vault and Kubernetes.
Configure your vault environment and use telepresence for k8s to test.
```
npm test
```

### Mocking K8S pod environment
```
sudo sh -c "mkdir -p /var/run/secrets/kubernetes.io/serviceaccount/ && kubectl get -n default secret $(kubectl get sa default -n default -o jsonpath='{.secrets[0].name}') -o json | jq '.data.token' -r | base64 -D > /var/run/secrets/kubernetes.io/serviceaccount/token"
```

### Update coverage badge
```
npm run test:badge
```
