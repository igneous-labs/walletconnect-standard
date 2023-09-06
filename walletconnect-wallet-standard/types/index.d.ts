/**
 * Registers WalletConnect Wallet when wallet-standard is ready
 * @param {string} projectId WalletConnect Project ID (from https://cloud.walletconnect.com)
 * @param {keyof typeof WalletConnectChainID} network Solana network to connect to
 * @param {import('@walletconnect/types').CoreTypes.Metadata} metadata Metadata for your dapp (will be shown in the Wallet)
 */
export function registerWalletConnect(projectId: string, network: keyof typeof WalletConnectChainID, metadata: import('@walletconnect/types').CoreTypes.Metadata): void;
export class ClientNotInitializedError extends Error {
    constructor();
}
export class QRCodeModalError extends Error {
    constructor();
}
export class WalletConnectWallet {
    /**
     * @param {WalletConnectWalletAdapterConfig} config The configuration for the WalletConnect.
     */
    constructor(config: WalletConnectWalletAdapterConfig);
    /**
     * @private
     * @type {WalletConnectClient | undefined}
     */
    private _client;
    /**
     * @private
     * @type {import('@walletconnect/types').SessionTypes.Struct | undefined}
     */
    private _session;
    /**
     * @private
     * @type {string}
     */
    private _network;
    /**
     * @private
     * @type {import('@walletconnect/types').SignClientTypes.Options}
     */
    private _options;
    version: string;
    name: string;
    icon: string;
    chains: string[];
    /**
     * @returns {WalletConnectClient}
     */
    get client(): WalletConnectClient;
    /**
     * @returns {string}
     */
    get publicKey(): string;
    features: {
        "standard:connect": {
            /**
             * Connects the wallet.
             * @returns {Promise<WalletConnectWalletInit>}
             */
            connect: () => Promise<WalletConnectWalletInit>;
        };
        "standard:disconnect": {
            /**
             * Disconnects the wallet.
             * @throws {ClientNotInitializedError}
             */
            disconnect: () => Promise<void>;
        };
        /**
         * Signs and sends transaction.
         * @param {string} transaction - The transaction to sign.
         * @returns {Promise<string>} signature
         * @throws {ClientNotInitializedError}
         */
        "solana:signAndSendTransaction": {
            signAndSendTransaction: (transaction: any) => Promise<any>;
        };
        "solana:signTransaction": {
            /**
             * Signs a transaction.
             * @param {string} transaction - The transaction to sign.
             * @returns {Promise<string>} signature
             * @throws {ClientNotInitializedError}
             */
            signTransaction: (transaction: string) => Promise<string>;
        };
        "solana:signMessage": {
            /**
             * Signs a message.
             * @param {Uint8Array} message The message to sign.
             * @returns {Promise<Uint8Array>}
             * @throws {ClientNotInitializedError}
             */
            signMessage: (message: Uint8Array) => Promise<Uint8Array>;
        };
    };
    accounts: WalletConnectWalletAccount[];
}
export type WalletConnectWalletAdapterConfig = {
    /**
     * The network ID.
     */
    network: string;
    /**
     * The options for the client.
     */
    options: import('@walletconnect/types').SignClientTypes.Options;
};
export type WalletConnectWalletInit = {
    /**
     * The public key.
     */
    publicKey?: string;
};
type WalletConnectChainID = string;
declare namespace WalletConnectChainID {
    const Mainnet: string;
    const Devnet: string;
}
import WalletConnectClient from "@walletconnect/sign-client";
declare class WalletConnectWalletAccount {
    /**
     * @param {import('@walletconnect/types').SessionTypes.Struct} [session] connected Wallet session.
     * @param {string[]} chains WalletConnect chains.
     */
    constructor(session?: import('@walletconnect/types').SessionTypes.Struct, chains?: string[]);
    address: string;
    chains: string[];
    features: string[];
}
export {};
