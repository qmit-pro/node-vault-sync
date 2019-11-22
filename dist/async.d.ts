export default function vaultAsync<T>(factory: VaultReaderFactory<T>, opts: VaultReaderOptions): Promise<T>;
export declare type VaultReaderOptions = {
    uri: string;
    method: string;
    role: string;
    debug?: boolean;
    ignoreLocalToken?: boolean;
    ignoreK8sSAToken?: boolean;
};
export declare type VaultReaderFactory<T = any> = (get: (itemPath: string) => Promise<any>, list: (itemPath: string) => Promise<any>) => Promise<T>;
