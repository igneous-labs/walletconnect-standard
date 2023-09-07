import { binary_to_base58 as binaryToBase58 } from "base58-js";
import {
  defineCustomElement,
  WALLET_CONNECTED_EVENT_TYPE,
  WALLET_DISCONNECTED_EVENT_TYPE,
} from "wallet-standard-list";
import { registerWalletConnectWalletStandard } from "walletconnect-wallet-standard";

/** @type {import("wallet-standard-list").WalletStandardList} */ // @ts-ignore
const WALLET_STANDARD_LIST = document.querySelector("wallet-standard-list");

/** @type {HTMLSpanElement} */ // @ts-ignore
const CONNECTED_WALLET_SPAN = document.getElementById("connected-wallet");

/** @type {HTMLSpanElement} */ // @ts-ignore
const FIRST_ACCOUNT_SPAN = document.getElementById("first-account");

/** @type {HTMLButtonElement} */ // @ts-ignore
const STAKE_BUTTON = document.getElementById("stake-button");

/** @type {HTMLButtonElement} */ // @ts-ignore
const SIGN_STAKE_BUTTON = document.getElementById("sign-stake-button");

/** @type {HTMLButtonElement} */ // @ts-ignore
const SIGN_MSG_BUTTON = document.getElementById("sign-msg-button");

/** @type {HTMLButtonElement} */ // @ts-ignore
const DISCONNECT_BUTTON = document.getElementById("disconnect-button");

const base64ToUint8 = (str) =>
  Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

async function stake() {
  const wallet = WALLET_STANDARD_LIST.connectedWallet;
  const account = wallet.accounts[0];
  const user = account.address;
  const url = `https://stakedex-api.fly.dev/v1/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X&inAmount=1000000000&user=${user}`;
  const resp = await fetch(url);
  const { tx } = await resp.json();
  const buf = base64ToUint8(tx);
  const [{ signature }] = await wallet.features[
    "solana:signAndSendTransaction"
  ].signAndSendTransaction({
    chain: "solana:mainnet",
    account,
    transaction: buf,
  });
  alert(`Signature: ${binaryToBase58(signature)}`);
}

async function signStakeTx() {
  const wallet = WALLET_STANDARD_LIST.connectedWallet;
  const account = wallet.accounts[0];
  const user = account.address;
  const url = `https://stakedex-api.fly.dev/v1/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X&inAmount=1000000000&user=${user}`;
  const resp = await fetch(url);
  const { tx } = await resp.json();
  const buf = base64ToUint8(tx);
  const [{ signedTransaction }] = await wallet.features[
    "solana:signTransaction"
  ].signTransaction({
    account,
    transaction: buf,
  });
  alert(`Signed Tx: ${binaryToBase58(signedTransaction)}`);
}

async function signMsg() {
  const wallet = WALLET_STANDARD_LIST.connectedWallet;
  const account = wallet.accounts[0];
  const [{ signedMessage, signature }] = await wallet.features[
    "solana:signMessage"
  ].signMessage({
    account,
    message: new TextEncoder().encode("test message"),
  });
  alert(
    `signed msg: ${new TextDecoder().decode(
      signedMessage
    )}. Signature: ${signature}`
  );
}

const projectId = "4374d1c29d9988dcea189594474af595";
registerWalletConnectWalletStandard({
  projectId,
  metadata: {
    name: "My Dapp",
    description: "My Dapp description",
    url: "https://my-dapp.com",
    icons: ["https://my-dapp.com/logo.png"],
  },
});
defineCustomElement();

window.addEventListener(
  WALLET_CONNECTED_EVENT_TYPE,
  // @ts-ignore
  ({ detail: wallet }) => {
    CONNECTED_WALLET_SPAN.innerText = wallet.name;
    FIRST_ACCOUNT_SPAN.innerText = wallet.accounts[0].address;
    for (const btnToEnable of [
      STAKE_BUTTON,
      DISCONNECT_BUTTON,
      SIGN_STAKE_BUTTON,
      SIGN_MSG_BUTTON,
    ]) {
      btnToEnable.removeAttribute("disabled");
    }
  }
);

window.addEventListener(WALLET_DISCONNECTED_EVENT_TYPE, () => {
  CONNECTED_WALLET_SPAN.innerText = "None";
  FIRST_ACCOUNT_SPAN.innerText = "None";
  for (const btnToDisable of [
    STAKE_BUTTON,
    DISCONNECT_BUTTON,
    SIGN_STAKE_BUTTON,
    SIGN_MSG_BUTTON,
  ]) {
    btnToDisable.setAttribute("disabled", "1");
  }
});

DISCONNECT_BUTTON.onclick = () => {
  WALLET_STANDARD_LIST.disconnect();
};

STAKE_BUTTON.onclick = stake;
SIGN_STAKE_BUTTON.onclick = signStakeTx;
SIGN_MSG_BUTTON.onclick = signMsg;
