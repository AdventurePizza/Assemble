// @ts-nocheck
import { useCallback, useState, useEffect } from "react";
import constate from "constate";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";

class LambdaViewSigner {
  async publicKeyHash() {
    const acc = await wallet.client.getActiveAccount();
    if (!acc) throw new Error("Not connected");
    return acc.address;
  }
  async publicKey() {
    const acc = await wallet.client.getActiveAccount();
    if (!acc) throw new Error("Not connected");
    return acc.publicKey;
  }
  async secretKey() {
    throw new Error("Secret key cannot be exposed");
  }
  async sign() {
    throw new Error("Cannot sign");
  }
}

const options = {
  name: 'Assemblr',
  iconUrl: 'https://assemblr.xyz/favicon.ico',
  preferredNetwork: 'mainnet',
};


const Tezos = new TezosToolkit("https://mainnet.smartpy.io");
const wallet = new BeaconWallet(options);

Tezos.setWalletProvider(wallet);
Tezos.setSignerProvider(new LambdaViewSigner());

export const [UseBeaconProvider, useBeacon] = constate(() => {
  const [pkh, setUserPkh] = useState();

  useEffect(() => {
    async function getActive() {
      const activeAcc = await wallet.client.getActiveAccount();
      if (activeAcc) {
        setUserPkh(await wallet.getPKH());
      }
    }
    getActive();
  }, []);

  const sync = useCallback(async () => {

    const activeAcc = await wallet.client.getActiveAccount();
    if (!activeAcc) {
      await wallet.disconnect();
      await wallet.clearActiveAccount();


      await wallet.requestPermissions({
        network: { type: "mainnet" },
      });
      console.log(4)
      Tezos.setWalletProvider(wallet);
      Tezos.setRpcProvider("https://mainnet.smartpy.io");
      const activeAcc = await wallet.client.getActiveAccount();
      if (!activeAcc) {
        throw new Error("Not connected");
      }
      setUserPkh(await wallet.getPKH());
    } else {
      setUserPkh(await wallet.getPKH());
    }

  }, []);

  const unsync = useCallback(async () => {
    await wallet.disconnect();
    await wallet.clearActiveAccount();
    Tezos.setWalletProvider(wallet);
    setUserPkh(undefined);
  }, []);

  return {
    sync,
    unsync,
    isConnected: !!pkh,
    Tezos,
    wallet,
    pkh,
  };
});

export default useBeacon;
