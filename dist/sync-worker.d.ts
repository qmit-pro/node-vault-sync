export default function rpcWorker(): ([serializedFactory, serializedOpts]: [string, string]) => Promise<unknown>;
