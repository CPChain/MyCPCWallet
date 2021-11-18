import { Manager as Web3RequestManager } from 'web3-core-requestmanager';
import { CustomRequestManager } from './given-provider';
import MiddleWare from '../middleware';
import { EventBus } from '@/core/plugins/eventBus';
import VuexStore from '@/core/store';
import {
  cpcSendTransaction,
  ethSign,
  ethSignTransaction,
  cpcGetTransactionCount
} from '../methods';
import Web3 from 'web3';
import * as ethers from '@/lib/cpchain.min.js';

class CustomCPChainRequestManager extends Web3RequestManager {
  constructor(host) {
    super(host);
    this.is_cpchain =
      typeof host === 'string' && host && host.indexOf('cpchain') !== -1;
    this.requestManager = new CustomRequestManager(host);
    this.cpchainProvider = new ethers.providers.JsonRpcProvider(
      'https://civilian.cpchain.io'
    );
  }
  request(payload) {
    if (this.is_cpchain) {
      payload.id = 1;
    }
    return new Promise((resolve, reject) => {
      const callback = (error, result) => {
        if (error) return reject(error.error);
        if (result.error) return reject(result.error);
        return resolve(result.result);
      };

      const req = {
        payload,
        store: VuexStore,
        requestManager: this.requestManager,
        cpchainProvider: this.cpchainProvider,
        eventHub: EventBus
      };
      const middleware = new MiddleWare();
      middleware.use(cpcSendTransaction);
      middleware.use(ethSignTransaction);
      middleware.use(cpcGetTransactionCount);
      middleware.use(ethSign);
      middleware.run(req, callback).then(() => {
        if (this.provider.request_) {
          this.provider.request_(payload).then(resolve).catch(reject);
        } else if (this.provider.sendAsync) {
          this.provider.sendAsync(payload, callback);
        } else if (this.provider.send) {
          this.provider.send(payload, callback);
        }
      });
    });
  }
  send(data, callback) {
    const { method, params } = data;
    console.log('---->>>>>>666', method, params);
    if (this.provider.request_) {
      this.provider
        .request_({ method, params })
        .then(res => {
          callback(null, res);
        })
        .catch(err => callback(err));
    } else {
      this.request({ method, params })
        .then(res => {
          callback(null, res);
        })
        .catch(err => callback(err));
    }
  }
}
class CPChainProvider {
  constructor(host) {
    const requestManager = new CustomCPChainRequestManager(host);
    this.givenProvider = new Web3(requestManager);
    if (this.givenProvider.request && !this.givenProvider.request_) {
      this.givenProvider.request_ = this.givenProvider.request;
    }
    return this.givenProvider;
  }
}
export { CustomRequestManager };
export default CPChainProvider;
