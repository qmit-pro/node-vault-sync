export declare const VAULT_TOKEN_PATH: string;
export declare const K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";
export default function vaultAsync<T, S>(factory: VaultReaderFactory<T, S>, opts: VaultReaderOptions<S>): Promise<T>;
export declare type VaultReaderOptions<S extends {} = {
    [key: string]: any;
}> = {
    uri: string;
    method: string;
    role: string;
    debug?: boolean;
    ignoreLocalToken?: boolean;
    ignoreK8sSAToken?: boolean;
    sandbox?: S;
};
export declare type VaultReaderFactory<T = any, S = any> = (get: (itemPath: string) => Promise<any>, list: (itemPath: string) => Promise<any>, sandbox: NonNullable<S>) => Promise<T>;
export declare class VaultError extends Error {
    private code;
    constructor(props: any, code: number);
}
export declare class VaultReader<S> {
    private readonly opts;
    private token;
    constructor(opts: VaultReaderOptions<S>);
    getToken(): Promise<void>;
    generateWithFactory<T = any>(factory: VaultReaderFactory<T, S>): Promise<T>;
    call(itemPath: string, method: string): Promise<any>;
    read(itemPath: string): Promise<any>;
    list(itemPath: string): Promise<any>;
}
