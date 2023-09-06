# walletconnect-standard

Adapter for registering `WalletConnect` alongside with every default wallet-standard wallet via [wallet-standard-list](https://github.com/igneous-labs/wallet-standard-list/blob/master/wallet-standard-list) library.

## Example

First, register the WalletConnect adapter:

```js
import { registerWalletConnect } from "walletconnect-standard";

// Get WalletConnect project ID from https://cloud.walletconnect.com
const projectId = "4374d1c29d9988dcea189594474af595";

// Register WalletConnect Wallet
registerWalletConnect(projectId, "Mainnet", {
  name: "My Dapp",
  description: "My Dapp description", url: "https://my-dapp.com",
  icons: ["https://my-dapp.com/logo.png"],
});
```

Then, add the `wallet-standard-list` element to the custom element registry:

```js
import { defineCustomElement } from "wallet-standard-list";

defineCustomElement(); // accepts an optional string arg for the custom element tag name, otherwise defaults to "wallet-standard-list"
```

You can now use it in your html:

```html
<wallet-standard-list
  required-features="solana:signAndSendTransaction, solana:signTransaction"
></wallet-standard-list>
```

## Basic Styling Example

See [wallet-standard-list README](https://github.com/igneous-labs/wallet-standard-list/blob/master/wallet-standard-list/README.md#basic-styling-example)

## Usage

See [wallet-standard-list README](https://github.com/igneous-labs/wallet-standard-list/blob/master/wallet-standard-list/README.md#usage)
