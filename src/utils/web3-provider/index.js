import GivenProvider from './providers/given-provider';
import WSProvider from './providers/ws-provider';
import WALLET_TYPES from '@/modules/access-wallet/common/walletTypes';
import VuexStore from '@/core/store';
import Web3 from 'web3';
class MEWProvider {
  constructor(host, options) {
    if (
      VuexStore.state.wallet &&
      VuexStore.state.wallet.identifier === WALLET_TYPES.WEB3_WALLET
    ) {
      return new GivenProvider(host, options);
    } else if (host && typeof host === 'string') {
      if (host.includes('etherscan')) {
        throw new Error('Not supported network type');
      } else if (/^http(s)?:\/\//i.test(host)) {
        if (host.includes('cpchain')) {
          return new GivenProvider(new Web3(host), options);
        }
        throw new Error('Not supported network type');
      } else if (/^ws(s)?:\/\//i.test(host)) {
        return new WSProvider(host, options);
      } else if (host) {
        throw new Error('Can\'t autodetect provider for "' + host + '"');
      }
    }
  }
}
export default MEWProvider;
