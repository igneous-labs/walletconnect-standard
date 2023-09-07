/**
 * Registers WalletConnect wallet adapter as a standard wallet
 * @param {SolanaWalletConnectWalletStandardCtorArgs} args
 */
export function registerWalletConnectWalletStandard(args: SolanaWalletConnectWalletStandardCtorArgs): void;
export class ChainNotSupportedError extends Error {
    constructor();
}
export class NoChainsSetError extends Error {
    constructor();
}
export class ClientNotInitializedError extends Error {
    constructor();
}
export class QRCodeModalError extends Error {
    constructor();
}
/**
 * @implements {WalletWithSolanaFeatures}
 */
export class WalletConnectWallet implements WalletWithSolanaFeatures {
    /**
     * @param {SolanaWalletConnectWalletStandardCtorArgs} args
     */
    constructor({ chains, ...options }: SolanaWalletConnectWalletStandardCtorArgs);
    /** @returns {"1.0.0"} */
    get version(): "1.0.0";
    /** @returns {WalletWithSolanaFeatures["icon"]} */
    get icon(): `data:image/svg+xml;base64,${string}` | `data:image/webp;base64,${string}` | `data:image/png;base64,${string}` | `data:image/gif;base64,${string}`;
    /** @returns {WalletWithSolanaFeatures["name"]} */
    get name(): string;
    /** @returns {WalletWithSolanaFeatures["chains"]} */
    get chains(): import("@wallet-standard/base").IdentifierArray;
    /** @returns {WalletWithSolanaFeatures["accounts"]} */
    get accounts(): readonly import("@wallet-standard/base").WalletAccount[];
    /** @returns {WalletWithSolanaFeatures["features"] & import("@wallet-standard/features").StandardConnectFeature & import("@wallet-standard/features").StandardDisconnectFeature & import("@wallet-standard/features").StandardEventsFeature} */
    get features(): import("@solana/wallet-standard-features").SolanaFeatures & import("@wallet-standard/features").StandardConnectFeature & import("@wallet-standard/features").StandardDisconnectFeature & import("@wallet-standard/features").StandardEventsFeature;
    /** @returns {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionFeature["solana:signAndSendTransaction"]["supportedTransactionVersions"]} */
    get supportedTransactionVersions(): readonly import("@solana/wallet-standard-features").SolanaTransactionVersion[];
    /** @returns {NonLocalnetChain} */
    get defaultChain(): NonLocalnetChain;
    #private;
}
export type WalletWithSolanaFeatures = import("@solana/wallet-standard-features").WalletWithSolanaFeatures;
export type NonLocalnetChain = Exclude<import("@solana/wallet-standard-chains").SolanaChain, "solana:localnet">;
export type MaybeNonLocalnetChainsProp = {
    chains?: NonLocalnetChain[] | null | undefined;
};
export type SolanaWalletConnectWalletStandardCtorArgs = MaybeNonLocalnetChainsProp & {
    projectId: string;
    options: import('@walletconnect/types').SignClientTypes.Options;
};
export type WalletConnectAccount = {
    address: string;
};
export type MaybeChainProp = {
    chain?: import("@wallet-standard/base").IdentifierString | null | undefined;
};
export type Cluster = 'mainnet-beta' | 'devnet';
