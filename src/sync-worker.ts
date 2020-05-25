import vaultAsync from "./async";

export default function rpcWorker() {
  return function([serializedFactory, serializedOpts]: [string, string]) {
    return vaultAsync(eval(serializedFactory), JSON.parse(serializedOpts));
  };
}
