import { Wallet } from "ethers";

export default class EVMAccount {
  constructor(opts = {}) {
    if (!opts.privKey) {
      throw new Error("Private key is required to create an EVM account.");
    }
    const wallet = new Wallet(opts.privKey);
    this.address = wallet.address;
    this.privKey = opts.privKey;
  }

  _serialize() {
    var data = {
      address: this.address,
      privKey: this.privKey,
    };
    return JSON.stringify(data);
  }
}
