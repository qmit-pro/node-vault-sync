import vaultAsync from "./async";
import vaultSync from "./sync";

export type VaultReader = typeof vaultSync & {
  async: typeof vaultAsync;
};

const vault: VaultReader = vaultSync as any;
vault.async = vaultAsync;

export { vault };
export default vault;
