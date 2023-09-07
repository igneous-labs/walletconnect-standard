import {
  SOLANA_DEVNET_CHAIN,
  SOLANA_MAINNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
} from "@solana/wallet-standard-chains";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectClient from "@walletconnect/sign-client";
import { getSdkError, parseAccountId } from "@walletconnect/utils";
import { binary_to_base58 as binaryToBase58 } from "base58-js";

// need to redefine type because @implements doesnt allow import for some reason
/** @typedef {import("@solana/wallet-standard-features").WalletWithSolanaFeatures} WalletWithSolanaFeatures */

/** @typedef {Exclude<import("@solana/wallet-standard-chains").SolanaChain, "solana:localnet">} NonLocalnetChain */

// typedef here just to use [optionalProp] syntax
/**
 * @typedef MaybeNonLocalnetChainsProp
 * @property {NonLocalnetChain[] | null | undefined} [chains]
 */

/** @typedef {MaybeNonLocalnetChainsProp & { projectId: string, options: import('@walletconnect/types').SignClientTypes.Options }} SolanaWalletConnectWalletStandardCtorArgs */

/** @typedef {{ address: string }} WalletConnectAccount */

// typedef here just to use [optionalProp] syntax for #areAllChainsSupported
/**
 * @typedef MaybeChainProp
 * @property {import("@wallet-standard/base").IdentifierString | null | undefined} [chain]
 */

/** @typedef {'mainnet-beta' | 'devnet'} Cluster */

/**
 * @type {Record<Cluster, string>}
 */
const WalletConnectChainID = {
  "mainnet-beta": "solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ",
  devnet: "solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K",
};

/**
 * @enum {string}
 */
const WalletConnectRPCMethods = {
  signTransaction: "solana_signTransaction",
  signMessage: "solana_signMessage",
};

/**
 * Returns the connection parameters based on the chain ID.
 *
 * @param {string} chain The chain ID.
 * @returns {import('@walletconnect/types').EngineTypes.FindParams} The connection parameters.
 */
const getConnectParams = (chain) => ({
  requiredNamespaces: {
    solana: {
      chains: [chain],
      methods: [
        WalletConnectRPCMethods.signTransaction,
        WalletConnectRPCMethods.signMessage,
      ],
      events: [],
    },
  },
});

export class ChainNotSupportedError extends Error {
  constructor() {
    super("chain not supported");
    // Set the prototype explicitly. https://stackoverflow.com/a/41429145/2247097
    Object.setPrototypeOf(this, ChainNotSupportedError.prototype);
  }
}

export class NoChainsSetError extends Error {
  constructor() {
    super("no chains set");
    // Set the prototype explicitly. https://stackoverflow.com/a/41429145/2247097
    Object.setPrototypeOf(this, NoChainsSetError.prototype);
  }
}

// Taken from https://stackoverflow.com/a/41429145/2247097
export class ClientNotInitializedError extends Error {
  constructor() {
    super();

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ClientNotInitializedError.prototype);
  }
}

export class QRCodeModalError extends Error {
  constructor() {
    super();

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, QRCodeModalError.prototype);
  }
}

/**
 * @implements {WalletWithSolanaFeatures}
 */
export class WalletConnectWallet {
  /* eslint-disable class-methods-use-this */

  /** @returns {"1.0.0"} */
  get version() {
    return "1.0.0";
  }

  /** @returns {WalletWithSolanaFeatures["icon"]} */
  get icon() {
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIGhlaWdodD0iMzMyIiB2aWV3Qm94PSIwIDAgNDgwIDMzMiIgd2lkdGg9IjQ4MCI+PHBhdGggZD0ibTEyNi42MTMgOTMuOTg0MmM2Mi42MjItNjEuMzEyMyAxNjQuMTUyLTYxLjMxMjMgMjI2Ljc3NSAwbDcuNTM2IDcuMzc4OGMzLjEzMSAzLjA2NiAzLjEzMSA4LjAzNiAwIDExLjEwMmwtMjUuNzgxIDI1LjI0MmMtMS41NjYgMS41MzMtNC4xMDQgMS41MzMtNS42NyAwbC0xMC4zNzEtMTAuMTU0Yy00My42ODctNDIuNzczNC0xMTQuNTE3LTQyLjc3MzQtMTU4LjIwNCAwbC0xMS4xMDcgMTAuODc0Yy0xLjU2NSAxLjUzMy00LjEwMyAxLjUzMy01LjY2OSAwbC0yNS43ODEtMjUuMjQyYy0zLjEzMi0zLjA2Ni0zLjEzMi04LjAzNiAwLTExLjEwMnptMjgwLjA5MyA1Mi4yMDM4IDIyLjk0NiAyMi40NjVjMy4xMzEgMy4wNjYgMy4xMzEgOC4wMzYgMCAxMS4xMDJsLTEwMy40NjMgMTAxLjMwMWMtMy4xMzEgMy4wNjUtOC4yMDggMy4wNjUtMTEuMzM5IDBsLTczLjQzMi03MS44OTZjLS43ODMtLjc2Ny0yLjA1Mi0uNzY3LTIuODM1IDBsLTczLjQzIDcxLjg5NmMtMy4xMzEgMy4wNjUtOC4yMDggMy4wNjUtMTEuMzM5IDBsLTEwMy40NjU3LTEwMS4zMDJjLTMuMTMxMS0zLjA2Ni0zLjEzMTEtOC4wMzYgMC0xMS4xMDJsMjIuOTQ1Ni0yMi40NjZjMy4xMzExLTMuMDY1IDguMjA3Ny0zLjA2NSAxMS4zMzg4IDBsNzMuNDMzMyA3MS44OTdjLjc4Mi43NjcgMi4wNTEuNzY3IDIuODM0IDBsNzMuNDI5LTcxLjg5N2MzLjEzMS0zLjA2NSA4LjIwOC0zLjA2NSAxMS4zMzkgMGw3My40MzMgNzEuODk3Yy43ODMuNzY3IDIuMDUyLjc2NyAyLjgzNSAwbDczLjQzMS03MS44OTVjMy4xMzItMy4wNjYgOC4yMDgtMy4wNjYgMTEuMzM5IDB6IiBmaWxsPSIjMzM5NmZmIi8+PC9zdmc+";
  }

  /** @returns {WalletWithSolanaFeatures["name"]} */
  get name() {
    return "WalletConnect";
  }

  /** @returns {WalletWithSolanaFeatures["chains"]} */
  get chains() {
    return this.#chains;
  }

  /** @returns {WalletWithSolanaFeatures["accounts"]} */
  get accounts() {
    const all = Object.values(this.#accounts).reduce((arr, clusterSubArr) => [
      ...arr,
      ...clusterSubArr,
    ]);
    return all.map(this.#walletConnectAccountToStandardAccount.bind(this));
  }

  /** @returns {WalletWithSolanaFeatures["features"] & import("@wallet-standard/features").StandardConnectFeature & import("@wallet-standard/features").StandardDisconnectFeature & import("@wallet-standard/features").StandardEventsFeature} */
  get features() {
    return {
      "solana:signAndSendTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: this.supportedTransactionVersions,
        signAndSendTransaction: this.#signAndSendTransaction.bind(this),
      },
      // TODO: signMessage currently only supports ascii messages
      "solana:signMessage": {
        version: "1.0.0",
        signMessage: this.#signMessage.bind(this),
      },
      "solana:signTransaction": {
        version: "1.0.0",
        supportedTransactionVersions: this.supportedTransactionVersions,
        signTransaction: this.#signTransaction.bind(this),
      },
      "standard:connect": {
        version: "1.0.0",
        connect: this.#connect.bind(this),
      },
      "standard:disconnect": {
        version: "1.0.0",
        disconnect: this.#disconnect.bind(this),
      },
      "standard:events": {
        version: "1.0.0",
        on: this.#on.bind(this),
      },
    };
  }

  // TODO: implement querying the WalletConnect for its supported tx versions
  /** @returns {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionFeature["solana:signAndSendTransaction"]["supportedTransactionVersions"]} */
  get supportedTransactionVersions() {
    return ["legacy", 0];
  }

  /** @returns {NonLocalnetChain} */
  get defaultChain() {
    const res = this.#chains[0];
    if (!res) {
      throw new NoChainsSetError();
    }
    return res;
  }

  /** @type {WalletConnectClient | undefined} */
  #client;

  /** @type {import('@walletconnect/types').SignClientTypes.Options} */
  #options;

  /** @type {NonLocalnetChain[]} */
  #chains;

  /** @type {Record<string, string | null>} */
  #authTokens;

  /** @type {Record<string, WalletConnectAccount[]>} */
  #accounts;

  /** @type {{ [E in import("@wallet-standard/features").StandardEventsNames]: Set<import("@wallet-standard/features").StandardEventsListeners[E]> }} */
  #listeners;

  /**
   * @param {SolanaWalletConnectWalletStandardCtorArgs} args
   */
  constructor({ chains, ...options }) {
    this.#chains = chains ?? ["solana:mainnet"];
    this.#options = options;
    this.#authTokens = {
      "mainnet-beta": null,
      devnet: null,
      testnet: null,
    };
    this.#accounts = {
      "mainnet-beta": [],
      devnet: [],
      testnet: [],
    };
    this.#listeners = {
      change: new Set(),
    };
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignAndSendTransactionMethod} */
  async #signAndSendTransaction(...inputs) {
    if (!this.#client) {
      throw new ClientNotInitializedError();
    }
    if (!areAllChainsSupported(inputs)) {
      throw new ChainNotSupportedError();
    }
    alert("not inplemented");
    return [];
    // const inputIndices = this.#inputsIndicesByChain(inputs);
    // const res = [];
    // for (const [chainUncasted, indices] of Object.entries(inputIndices)) {
    //   if (indices.length === 0) {
    //     continue;
    //   }
    //   /** @type {NonLocalnetChain} */ // @ts-ignore
    //   const chain = chainUncasted;
    //   const cluster = chainToCluster(chain);
    //   const rawTxs = indices.map((i) => inputs[i].transaction);
    //   const payloads = rawTxs.map(uint8ToBase64Ascii);

    //   /* eslint-disable no-await-in-loop */
    //   const b64Signatures = await this.#transact(cluster, async (wallet) => {
    //     const { signatures } = await wallet.signAndSendTransactions({
    //       payloads,
    //     });
    //     return signatures;
    //   });
    //   /* eslint-enable no-await-in-loop */
    //   const rawSignatures = b64Signatures.map(base64ToUint8Ascii);
    //   for (let i = 0; i < rawSignatures.length; i++) {
    //     const rawSignature = rawSignatures[i];
    //     const index = indices[i];
    //     res[index] = { signature: rawSignature };
    //   }
    // }
    // return res;
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignMessageMethod} */
  async #signMessage(...inputs) {
    if (!this.#client) {
      throw new ClientNotInitializedError();
    }
    if (inputs.length === 0) {
      return [];
    }
    // TODO: check if cluster matters
    const cluster = chainToCluster(this.defaultChain);
    const signatures = [];
    for (const input of inputs) {
      const formatted = signMessagesToWalletConnectFormat(input);
      // eslint-disable-next-line no-await-in-loop
      const { signature } = await this.#client.request({
        chainId: WalletConnectChainID[cluster],
        topic: this.#authTokens[cluster],
        request: {
          method: WalletConnectRPCMethods.signMessage,
          params: formatted,
        },
      });

      signatures.push(signature);
    }
    const res = [];
    for (let i = 0; i < inputs.length; i++) {
      res.push({
        signedMessage: inputs[i].message,
        signature: base64ToUint8Ascii(signatures[i]),
      });
    }
    return res;
  }

  /** @type {import("@solana/wallet-standard-features").SolanaSignTransactionMethod} */
  async #signTransaction(...inputs) {
    if (!this.#client) {
      throw new ClientNotInitializedError();
    }
    if (!areAllChainsSupported(inputs)) {
      throw new ChainNotSupportedError();
    }
    const inputIndices = this.#inputsIndicesByChain(inputs);
    const res = [];
    for (const [chainUncasted, indices] of Object.entries(inputIndices)) {
      if (indices.length === 0) {
        continue;
      }
      /** @type {NonLocalnetChain} */ // @ts-ignore
      const chain = chainUncasted;
      const cluster = chainToCluster(chain);
      const rawTxs = indices.map((i) => inputs[i].transaction);
      const payloads = rawTxs.map(uint8ToBase64Ascii);
      const b64SignedPayloads = [];
      for (const payload of payloads) {
        // eslint-disable-next-line no-await-in-loop
        const { signature } = await this.#client.request({
          chainId: WalletConnectChainID[cluster],
          topic: this.#authTokens[cluster],
          request: {
            method: WalletConnectRPCMethods.signTransaction,
            params: {
              transaction: payload,
            },
          },
        });

        b64SignedPayloads.push(signature);
      }
      const rawPayloads = b64SignedPayloads.map(base64ToUint8Ascii);
      for (let i = 0; i < rawPayloads.length; i++) {
        const rawPayload = rawPayloads[i];
        const index = indices[i];
        res[index] = { signedTransaction: rawPayload };
      }
    }
    return res;
  }

  /** @type {import("@wallet-standard/features").StandardConnectMethod} */
  async #connect(input) {
    // TODO: use silent param by saving authToken to localStorage
    const silent = input?.silent ?? false;
    if (silent) {
      throw new Error("silent connect not yet implemented");
    }

    const client =
      this.#client ?? (await WalletConnectClient.init(this.#options));
    this.#client = client;

    let hasChanged = false;
    for (const chain of this.#chains) {
      const cluster = chainToCluster(chain);
      if (this.#authTokens[cluster] !== null) {
        continue;
      }
      const connectParams = getConnectParams(
        WalletConnectChainID[chainToCluster(chain)]
      );

      const sessions = client.find(connectParams).filter((s) => s.acknowledged);
      let session = sessions[sessions.length - 1];
      if (!session) {
        /* eslint-disable no-await-in-loop */
        const { uri, approval } = await client.connect(connectParams);

        if (uri) {
          QRCodeModal.open(uri, () => {
            // eslint-disable-next-line no-new
            new QRCodeModalError();
          });
        }

        // eslint-disable-next-line no-await-in-loop
        session = await approval();

        QRCodeModal.close();
      }
      this.#accounts[cluster] =
        session.namespaces.solana.accounts.map(parseAccountId);
      this.#authTokens[cluster] = session.topic;
      hasChanged = true;
    }
    const res = {
      accounts: this.accounts,
    };
    if (hasChanged) {
      this.#emit("change", res);
    }
    return res;
  }

  /** @type {import("@wallet-standard/features").StandardDisconnectMethod} */
  async #disconnect() {
    if (!this.#client) {
      throw new ClientNotInitializedError();
    }

    const authTokens = Object.values(this.#authTokens);
    const noChange = authTokens.every((opt) => opt === null);
    this.#authTokens = {
      "mainnet-beta": null,
      devnet: null,
      testnet: null,
    };
    this.#accounts = {
      "mainnet-beta": [],
      devnet: [],
      testnet: [],
    };

    if (!noChange) {
      this.#emit("change", { accounts: this.accounts });
      for (const authToken of authTokens) {
        if (authToken === null) {
          continue;
        }
        await this.#client.disconnect({
          topic: authToken,
          reason: getSdkError("USER_DISCONNECTED"),
        });
      }
    }
  }

  /** @type {import("@wallet-standard/features").StandardEventsOnMethod} */
  #on(event, listener) {
    this.#listeners[event].add(listener);
    const off = () => {
      this.#listeners[event].delete(listener);
    };
    return off.bind(this);
  }

  /**
   *
   * @param {WalletConnectAccount} account
   * @returns {import("@wallet-standard/base").WalletAccount}
   */
  #walletConnectAccountToStandardAccount({ address }) {
    const uint8Addr = base64ToUint8Ascii(address);

    /** @type {import("@wallet-standard/base").IdentifierArray} */
    // @ts-ignore
    const features = Object.keys(this.features);
    return {
      address,
      publicKey: uint8Addr,
      chains: this.chains,
      features,
    };
  }

  /**
   * @template {import("@wallet-standard/features").StandardEventsNames} E
   * @param {E} event
   * @param  {Parameters<import("@wallet-standard/features").StandardEventsListeners[E]>} args
   */
  #emit(event, ...args) {
    for (const listener of this.#listeners[event]) {
      // eslint-disable-next-line prefer-spread
      listener.apply(null, args);
    }
  }

  /**
   * Defaults to first chain of this.chains if chain not provided
   * @template {{ chain: NonLocalnetChain | null | undefined }} I
   * @param {I[]} inputs
   * @returns {Record<NonLocalnetChain, number[]>}
   */
  #inputsIndicesByChain(inputs) {
    const { defaultChain } = this;
    /** @type {Record<NonLocalnetChain, number[]>} */
    const res = {
      "solana:devnet": [],
      "solana:mainnet": [],
      "solana:testnet": [],
    };
    for (let i = 0; i < inputs.length; i++) {
      const { chain } = inputs[i];
      if (chain) {
        res[chain].push(i);
      } else {
        res[defaultChain].push(i);
      }
    }
    return res;
  }
}

/**
 * @param {string} asciiStr base64 encoded string
 * @returns {Uint8Array}
 */
function base64ToUint8Ascii(asciiStr) {
  return Uint8Array.from(atob(asciiStr), (c) => c.charCodeAt(0));
}

/**
 *
 * @param {Uint8Array} asciiUint8Array
 * @returns {string}
 */
function uint8ToBase64Ascii(asciiUint8Array) {
  return btoa(String.fromCharCode(...asciiUint8Array));
}

/**
 *
 * @param {NonLocalnetChain} chain
 * @returns {Cluster}
 */
function chainToCluster(chain) {
  switch (chain) {
    case "solana:devnet":
      return "devnet";
    case "solana:mainnet":
      return "mainnet-beta";
    default:
      throw new Error(`unknown solana chain ${chain}`);
  }
}

/**
 * @template {MaybeChainProp} I
 * @param {I[]} inputs
 * @returns {inputs is Array<I & { chain: NonLocalnetChain | null | undefined }>}
 */
function areAllChainsSupported(inputs) {
  for (const { chain } of inputs) {
    if (
      chain !== null &&
      chain !== undefined &&
      chain !== SOLANA_DEVNET_CHAIN &&
      chain !== SOLANA_MAINNET_CHAIN &&
      chain !== SOLANA_TESTNET_CHAIN
    ) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @param {import("@solana/wallet-standard-features").SolanaSignMessageInput} msg
 * @returns {{  }}
 */
function signMessagesToWalletConnectFormat(msg) {
  /** @type {ReturnType<typeof signMessagesToWalletConnectFormat>} */
  return {
    pubkey: msg.account.address,
    message: binaryToBase58(msg.message),
  };
}

/**
 * Registers WalletConnect wallet adapter as a standard wallet
 * @param {SolanaWalletConnectWalletStandardCtorArgs} args
 */
export function registerWalletConnectWalletStandard(args) {
  /** @type {import("@wallet-standard/base").WalletEventsWindow} */
  const walletEventsWindow = window;
  walletEventsWindow.addEventListener(
    "wallet-standard:app-ready",
    ({ detail: { register } }) => {
      register(new WalletConnectWallet(args));
    }
  );
}
