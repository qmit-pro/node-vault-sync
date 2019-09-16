# node-vault-sync

Generate configuration object ***synchronously*** from HashiCorp Vault by automatic authenticating with ***locally cached token*** or ***kubernetes*** service account in pod environment.

![coverage-lines](./coverage/badge-lines.svg)
![coverage-statements](./coverage/badge-statements.svg)
![coverage-functions](./coverage/badge-functions.svg)
![coverage-branches](./coverage/badge-branches.svg)
[![NPM version](https://img.shields.io/npm/v/node-vault-sync.svg)](https://www.npmjs.com/package/node-vault-sync)

## Features
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

## Usage
### 1. Install

#### NPM
```bash
$ npm i --save node-vault-sync
```

### 2. Examples
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

#### ./production-example1.js
```js
const vault = require("node-vault-sync");

/*
 * Read mandatory environment variables
 */
process.env.APP_K8S_CLUSTER = process.env.APP_K8S_CLUSTER || "dev"; // dev, dev-2, prod, prod-2. prod-asia-northeast-1a-2, ... GKE cluster name
process.env.APP_ENV = process.env.APP_ENV || "dev"; // dev, stage, prod, ... app provision envrionment

module.exports = vault(async get => {
    const webhooks = await get("common/data/webhooks").then(res => res.data);
    return {
        webhooks,
        APP_ENV: process.env.APP_ENV,
    };
}, {
    // vault connection setting
    uri: "https://vault.internal.qmit.pro",
    debug: false,

    // alternative auth method for kubernetes pod
    method: `k8s/${process.env.APP_K8S_CLUSTER}`,
    role: "default",
});
```

#### ./production-example2.js
```js
const vault = require("node-vault-sync");

/*
 * Read mandatory environment variables
 */
process.env.APP_K8S_CLUSTER = process.env.APP_K8S_CLUSTER || "dev"; // dev, dev-2, prod, prod-2. prod-asia-northeast-1a-2, ... GKE cluster name
process.env.APP_ENV = process.env.APP_ENV || "dev"; // dev, stage, prod, ... app provision envrionment
const { APP_ENV, APP_K8S_CLUSTER } = process.env;

/*
 * Read common credentials and metadata
 */
const config = vault(async (get, list) => {
	const [
		stackdriverCredentials,
		services,
		serviceKeysWithCredentials,
	] = await Promise.all([
		get("common/data/gcp-stackdriver-service-account").then(res => res.data),
		get("common/data/services").then(res => res.data),
		list("common/metadata/services/credentials").then(res => res.keys),
	]);
	return {
		stackdriverCredentials,
		services,
		serviceKeysWithCredentials,
		serviceKeys: services.groups.reduce((names, g) => names.concat(g.items.map(i => i.key)), []),
	};
}, {
	// vault connection setting
	uri: "https://vault.internal.qmit.pro",
	debug: false,

	// alternative auth method for kubernetes pod
	method: `k8s/${APP_K8S_CLUSTER}`,
	role: "default",
});
```

## TypeScript Support
Supported from ES6: async/await poly-filled.

## Development
### 1. Test
Currently it dose not provide mocking environment for Vault and Kubernetes.
Configure your vault environment and use telepresence for k8s to test.
```
npm test
```

### 2. Mocking K8S pod environment
```
sudo sh -c "mkdir -p /var/run/secrets/kubernetes.io/serviceaccount/ && kubectl get -n default secret $(kubectl get sa default -n default -o jsonpath='{.secrets[0].name}') -o json | jq '.data.token' -r | base64 -D > /var/run/secrets/kubernetes.io/serviceaccount/token"
```

### 3. Update coverage badge
```
npm run test:badge
```

### 4. Publish
- Update pcakage.json version
- Tag HEAD commit as same version name
- `npm publish`
