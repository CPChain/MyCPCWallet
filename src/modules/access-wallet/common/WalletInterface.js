import {
  getBufferFromHex,
  getSignTransactionObject,
  sanitizeHex,
  calculateChainIdFromV,
  eip1559Params
} from './helpers';
import {
  hashPersonalMessage,
  publicToAddress,
  bufferToHex,
  ecsign,
  isValidPrivate,
  isValidPublic,
  privateToPublic
} from 'ethereumjs-util';
import toBuffer from '@/core/helpers/toBuffer';
import commonGenerator from '@/core/helpers/commonGenerator';
import { Transaction, FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import { toChecksumAddress } from '@/core/helpers/addressUtils';
import store from '@/core/store';
import { reject } from 'underscore';
import * as ethers from '@/lib/cpchain.min.js';

class WalletInterface {
  constructor(key, isPub = false, identifier, nick, keystore) {
    this.nickname = nick !== null && nick !== '' ? nick : '';
    this.keystore = keystore !== null && keystore !== '' ? keystore : '';
    this.identifier = identifier;
    if (!isPub) {
      const _privKey = Buffer.isBuffer(key)
        ? key
        : getBufferFromHex(sanitizeHex(key));
      if (!isValidPrivate(_privKey))
        throw new Error(
          'Private key does not satisfy the curve requirements (ie. it is invalid)'
        );
      this.privateKey = _privKey;
      this.publicKey = privateToPublic(_privKey);
      this.isPubOnly = false;
    } else {
      const _pubKey = Buffer.isBuffer(key) ? key : getBufferFromHex(key);
      if (_pubKey.length !== 20 && !isValidPublic(_pubKey, true))
        throw new Error('Invalid public key');
      if (_pubKey.length === 20) this.isAddress = true;
      this.publicKey = _pubKey;
      this.isPubOnly = true;
    }
    this.meta = {
      name: keystore ? 'Key store' : 'Private Key',
      img: {
        type: 'mew-icon',
        value: keystore ? 'keystore' : 'privateKey'
      }
    };
  }
  getPrivateKey() {
    if (this.isPubOnly) throw new Error('public key only wallet');
    return this.privateKey;
  }

  getPrivateKeyString() {
    if (this.isPubOnly) throw new Error('public key only wallet');
    return bufferToHex(this.getPrivateKey());
  }

  getNickname() {
    if (this.nickname === '') return '';
    return this.nickname;
  }

  getKeystore() {
    if (this.keystore === '') return '';
    return this.keystore;
  }

  getPublicKey() {
    if (this.isAddress) throw new Error('Address only wallet');
    return this.publicKey;
  }

  getPublicKeyString() {
    return bufferToHex(this.getPublicKey());
  }

  getAddress() {
    if (this.isAddress) return this.publicKey;
    return publicToAddress(this.publicKey, true);
  }

  getAddressString() {
    return bufferToHex(this.getAddress());
  }

  getChecksumAddressString() {
    return toChecksumAddress(this.getAddressString());
  }
  signTransaction(txParams, signer) {
    if (this.isPubOnly && typeof signer !== 'function')
      throw new Error('public key only wallets needs a signer');
    if (!this.isPubOnly) {
      return new Promise(resolve => {
        // TODO Support CPChain
        if (txParams.chainId === 337) {
          const wallet = new ethers.Wallet(this.privateKey);
          const tx = {
            type: 0,
            nonce: txParams.nonce,
            to: txParams.to,
            value: txParams.value,
            gas: txParams.gas,
            gasPrice: txParams.gasPrice,
            input: txParams.data,
            chainId: 337
          };
          wallet
            .signCPCTransaction(tx)
            .then(signedTx => {
              resolve({
                rawTransaction: signedTx,
                tx: tx
              });
            })
            .catch(err => {
              reject(err);
            });
          return;
        }

        let tx = Transaction.fromTxData(txParams, {
          common: commonGenerator(store.getters['global/network'])
        });
        if (store.getters['global/isEIP1559SupportedNetwork']) {
          const feeMarket = store.getters['global/gasFeeMarketInfo'];
          const _txParams = Object.assign(
            eip1559Params(txParams.gasPrice, feeMarket),
            txParams
          );
          delete _txParams.gasPrice;
          tx = FeeMarketEIP1559Transaction.fromTxData(_txParams, {
            common: commonGenerator(store.getters['global/network'])
          });
        }
        const networkId = tx.common.chainId();
        tx = tx.sign(this.privateKey);
        const signedChainId = tx.chainId
          ? parseInt(tx.chainId.toString())
          : calculateChainIdFromV(tx.v);
        if (signedChainId !== networkId)
          throw new Error(
            'Invalid networkId signature returned. Expected: ' +
              networkId +
              ', Got: ' +
              signedChainId,
            'InvalidNetworkId'
          );
        resolve(getSignTransactionObject(tx));
      });
    }
    return signer(txParams);
  }
  signMessage(msg, signer) {
    if (this.isPubOnly && typeof signer !== 'function')
      throw new Error('public key only wallets needs a signer');
    return new Promise((resolve, reject) => {
      if (!this.isPubOnly) {
        const msgHash = hashPersonalMessage(toBuffer(msg));
        const signed = ecsign(msgHash, this.privateKey);
        resolve(
          Buffer.concat([
            Buffer.from(signed.r),
            Buffer.from(signed.s),
            Buffer.from([signed.v])
          ])
        );
      } else {
        signer(msg).then(resolve).catch(reject);
      }
    });
  }
}
export default WalletInterface;
