import Ledger from '@ledgerhq/hw-app-eth';
import { byContractAddressAndChainId } from '@ledgerhq/hw-app-eth/erc20';
import { Transaction, FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import webUsbTransport from '@ledgerhq/hw-transport-webusb';
import WALLET_TYPES from '@/modules/access-wallet/common/walletTypes';
import bip44Paths from '@/modules/access-wallet/hardware/handlers/bip44';
import HDWalletInterface from '@/modules/access-wallet/common/HDWalletInterface';
import * as HDKey from 'hdkey';
import platform from 'platform';
import store from '@/core/store';
import commonGenerator from '@/core/helpers/commonGenerator';
import {
  getSignTransactionObject,
  getBufferFromHex,
  sanitizeHex,
  calculateChainIdFromV,
  eip1559Params,
  bufferToHex
} from '@/modules/access-wallet/common/helpers';
import toBuffer from '@/core/helpers/toBuffer';
import errorHandler from './errorHandler';
import Vue from 'vue';
import ledger from '@/assets/images/icons/wallets/ledger.svg';
import { rlp, bnToUnpaddedBuffer, BN, rlphash } from 'ethereumjs-util';
import * as ethers from '@/lib/cpchain.min.js';

const NEED_PASSWORD = false;

export function splitPath(path) {
  const result = [];
  const components = path.split('/');
  components.forEach(element => {
    let number = parseInt(element, 10);
    if (isNaN(number)) {
      return; // FIXME shouldn't it throws instead?
    }
    if (element.length > 1 && element[element.length - 1] === "'") {
      number += 0x80000000;
    }
    result.push(number);
  });
  return result;
}

function foreach(arr, callback) {
  function iterate(index, array, result) {
    if (index >= array.length) {
      return result;
    }
    return callback(array[index], index).then(function (res) {
      result.push(res);
      return iterate(index + 1, array, result);
    });
  }
  return Promise.resolve().then(() => iterate(0, arr, []));
}

class ledgerWallet {
  constructor() {
    this.identifier = WALLET_TYPES.LEDGER;
    this.isHardware = true;
    this.needPassword = NEED_PASSWORD;
    this.supportedPaths = bip44Paths[WALLET_TYPES.LEDGER];
    this.meta = {
      name: 'Ledger',
      img: {
        type: 'img',
        value: ledger
      }
    };
  }
  async init(basePath) {
    this.basePath = basePath ? basePath : this.supportedPaths[0].path;
    this.isHardened = this.basePath.split('/').length - 1 === 2;
    this.transport = await getLedgerTransport();
    this.ledger = new Ledger(this.transport);
    if (!this.isHardened) {
      const rootPub = await getRootPubKey(this.ledger, this.basePath);
      this.hdKey = new HDKey();
      this.hdKey.publicKey = Buffer.from(rootPub.publicKey, 'hex');
      this.hdKey.chainCode = Buffer.from(rootPub.chainCode, 'hex');
    }
  }
  async getAccount(idx) {
    let derivedKey, accountPath;
    if (this.isHardened) {
      const rootPub = await getRootPubKey(
        this.ledger,
        this.basePath + '/' + idx + "'"
      );
      const hdKey = new HDKey();
      hdKey.publicKey = Buffer.from(rootPub.publicKey, 'hex');
      hdKey.chainCode = Buffer.from(rootPub.chainCode, 'hex');
      derivedKey = hdKey.derive('m/0/0');
      accountPath = this.basePath + '/' + idx + "'" + '/0/0';
    } else {
      derivedKey = this.hdKey.derive('m/' + idx);
      accountPath = this.basePath + '/' + idx;
    }
    const txSigner = async txParams => {
      const networkId = store.getters['global/network'].type.chainID;
      const tokenInfo = txParams.to
        ? byContractAddressAndChainId(txParams.to, networkId)
        : null;
      if (tokenInfo) await this.ledger.provideERC20TokenInformation(tokenInfo);
      const legacySigner = async _txParams => {
        // TODO Support CPChain
        if (_txParams.chainId === 337) {
          const txdata = (0, toBuffer)(
            _txParams.data === '' ? '0x' : _txParams.data
          );
          const value = new BN(
            (0, toBuffer)(_txParams.value === '' ? '0x' : _txParams.value)
          );
          let gasLimit = null;
          if (typeof _txParams.gasLimit === 'object') {
            // Big Number
            const sLimit = _txParams.gasLimit.toString();
            const limit = new BN(sLimit);
            gasLimit = (0, bnToUnpaddedBuffer)(limit);
          } else {
            // hex string
            gasLimit = (0, toBuffer)(_txParams.gasLimit);
          }
          const raw = [
            (0, bnToUnpaddedBuffer)(new BN(0)),
            (0, toBuffer)(_txParams.nonce),
            (0, toBuffer)(_txParams.gasPrice),
            gasLimit,
            (0, toBuffer)(_txParams.to ? _txParams.to : '0x'),
            (0, bnToUnpaddedBuffer)(value),
            txdata,
            (0, bnToUnpaddedBuffer)(new BN(337)), // chainId
            (0, bnToUnpaddedBuffer)(new BN(0)),
            (0, bnToUnpaddedBuffer)(new BN(0))
          ];
          const message = rlp.encode(raw);
          // buffer
          const paths = splitPath(accountPath);
          let offset = 0;
          const toSend = [];
          const rlpTx = ethers.utils.RLP.decode(message).map(hex =>
            Buffer.from(hex.slice(2), 'hex')
          );

          const rlpVrs = Buffer.from(
            ethers.utils.RLP.encode(rlpTx.slice(-3)).slice(2),
            'hex'
          );

          let vrsOffset = message.length - (rlpVrs.length - 1);

          // First byte > 0xf7 means the length of the list length doesn't fit in a single byte.
          if (rlpVrs[0] > 0xf7) {
            // Increment vrsOffset to account for that extra byte.
            vrsOffset++;
            // Compute size of the list length.
            const sizeOfListLen = rlpVrs[0] - 0xf7;
            // Increase rlpOffset by the size of the list length.
            vrsOffset += sizeOfListLen - 1;
          }

          while (offset !== message.length) {
            const maxChunkSize =
              offset === 0 ? 150 - 1 - paths.length * 4 : 150;
            let chunkSize =
              offset + maxChunkSize > message.length
                ? message.length - offset
                : maxChunkSize;
            if (vrsOffset != 0 && offset + chunkSize >= vrsOffset) {
              // Make sure that the chunk doesn't end right on the EIP 155 marker if set
              chunkSize = message.length - offset;
            }
            const buffer = Buffer.alloc(
              offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize
            );
            if (offset === 0) {
              buffer[0] = paths.length;
              paths.forEach((element, index) => {
                buffer.writeUInt32BE(element, 1 + 4 * index);
              });
              message.copy(
                buffer,
                1 + 4 * paths.length,
                offset,
                offset + chunkSize
              );
            } else {
              message.copy(buffer, 0, offset, offset + chunkSize);
            }
            toSend.push(buffer);
            offset += chunkSize;
          }

          let response;
          const result = await foreach(toSend, (data, i) =>
            this.ledger.transport
              .send(0xe0, 0x04, i === 0 ? 0x00 : 0x80, 0x00, data)
              .then(apduResponse => {
                response = apduResponse;
              })
          ).then(() => {
            const response_byte = response.slice(0, 1)[0];
            let v = '';
            const chainId = 337;
            if (chainId * 2 + 35 + 1 > 255) {
              const oneByteChainId = (chainId * 2 + 35) % 256;

              const ecc_parity = response_byte - oneByteChainId;

              v = String(chainId * 2 + 35 + ecc_parity).toString(16);
            } else {
              v = response_byte.toString(16);
            }

            // Make sure v has is prefixed with a 0 if its length is odd ("1" -> "01").
            if (v.length % 2 == 1) {
              v = '0' + v;
            }

            const r = response.slice(1, 1 + 32).toString('hex');
            const s = response.slice(1 + 32, 1 + 32 + 32).toString('hex');
            return {
              v,
              r,
              s
            };
          });

          // EIP155 support. check/recalc signature v value.
          // const rv = parseInt(result.v, 16);
          // const cv = networkId * 2 + 35;
          // if (rv !== cv && (rv & cv) !== rv) {
          //   cv += 1; // add signature v bit.
          // }
          _txParams.v = result.v;
          _txParams.r = '0x' + result.r;
          _txParams.s = '0x' + result.s;

          const v = new BN(_txParams.v);
          const r = new BN((0, toBuffer)(_txParams.r));
          const s = new BN((0, toBuffer)(_txParams.s));

          const rawTransaction = rlp.encode([
            (0, bnToUnpaddedBuffer)(new BN(0)),
            (0, toBuffer)(_txParams.nonce),
            (0, toBuffer)(_txParams.gasPrice),
            gasLimit,
            (0, toBuffer)(_txParams.to ? _txParams.to : '0x'),
            (0, bnToUnpaddedBuffer)(value),
            txdata,
            (0, bnToUnpaddedBuffer)(v),
            (0, bnToUnpaddedBuffer)(r),
            (0, bnToUnpaddedBuffer)(s)
          ]);
          const hash = bufferToHex((0, rlphash)(raw));
          return {
            rawTransaction: bufferToHex(rawTransaction),
            tx: {
              ..._txParams,
              hash: hash
            }
          };
          // buffer end
        }
        const tx = new Transaction(_txParams, {
          common: commonGenerator(store.getters['global/network'])
        });
        const message = tx.getMessageToSign(false);
        const serializedMessage = rlp.encode(message);
        const result = await this.ledger.signTransaction(
          accountPath,
          serializedMessage.toString('hex')
        );
        // EIP155 support. check/recalc signature v value.
        const rv = parseInt(result.v, 16);
        let cv = networkId * 2 + 35;
        if (rv !== cv && (rv & cv) !== rv) {
          cv += 1; // add signature v bit.
        }
        _txParams.v = '0x' + cv.toString(16);
        _txParams.r = '0x' + result.r;
        _txParams.s = '0x' + result.s;
        const signedChainId = calculateChainIdFromV(_txParams.v);
        if (signedChainId !== networkId)
          throw new Error(
            Vue.$i18n.t('errorsGlobal.invalid-network-id-sig', {
              got: signedChainId,
              expected: networkId
            }),
            'InvalidNetworkId'
          );
        return getSignTransactionObject(Transaction.fromTxData(_txParams));
      };
      if (store.getters['global/isEIP1559SupportedNetwork']) {
        const feeMarket = store.getters['global/gasFeeMarketInfo'];
        const _txParams = Object.assign(
          eip1559Params(txParams.gasPrice, feeMarket),
          txParams
        );
        delete _txParams.gasPrice;
        const tx = FeeMarketEIP1559Transaction.fromTxData(_txParams, {
          common: commonGenerator(store.getters['global/network'])
        });
        const message = tx.getMessageToSign(false);
        try {
          // eslint-disable-next-line no-unused-vars
          const result = await this.ledger.signTransaction(
            accountPath,
            message.toString('hex')
          );
          _txParams.v = '0x' + result.v;
          _txParams.r = '0x' + result.r;
          _txParams.s = '0x' + result.s;
          return getSignTransactionObject(
            FeeMarketEIP1559Transaction.fromTxData(_txParams)
          );
        } catch (e) {
          //old ledger eth app version
          if (e.message === 'Ledger device: UNKNOWN_ERROR (0x6501)')
            return legacySigner(txParams);
          throw e;
        }
      } else {
        return legacySigner(txParams);
      }
    };
    const msgSigner = async msg => {
      const result = await this.ledger.signPersonalMessage(
        accountPath,
        toBuffer(msg).toString('hex')
      );
      const v = parseInt(result.v, 10) - 27;
      const vHex = sanitizeHex(v.toString(16));
      return Buffer.concat([
        getBufferFromHex(result.r),
        getBufferFromHex(result.s),
        getBufferFromHex(vHex)
      ]);
    };
    const displayAddress = async () => {
      await this.ledger.getAddress(accountPath, true, false);
    };
    return new HDWalletInterface(
      accountPath,
      derivedKey.publicKey,
      this.isHardware,
      this.identifier,
      errorHandler,
      txSigner,
      msgSigner,
      displayAddress,
      this.meta
    );
  }
  getCurrentPath() {
    return this.basePath;
  }
  getSupportedPaths() {
    return this.supportedPaths;
  }
}
const createWallet = async basePath => {
  const _ledgerWallet = new ledgerWallet();
  await _ledgerWallet.init(basePath);
  return _ledgerWallet;
};
createWallet.errorHandler = errorHandler;

const isWebUsbSupported = async () => {
  const isSupported = await webUsbTransport.isSupported();
  return isSupported && platform.name !== 'Opera';
};

const getLedgerTransport = async () => {
  let transport;
  const support = await isWebUsbSupported();
  if (support) {
    transport = await webUsbTransport.create();
  } else {
    throw new Error('WebUsb not supported.  Please try a different browser.');
  }
  return transport;
};

const getRootPubKey = async (_ledger, _path) => {
  const pubObj = await _ledger.getAddress(_path, false, true);
  return {
    publicKey: pubObj.publicKey,
    chainCode: pubObj.chainCode
  };
};

export default createWallet;
