import matic from '@/assets/images/networks/matic.svg';
import tokens from '@/_generated/tokens/tokens-matic.json';
export default {
  name: 'MATIC',
  name_long: 'MATIC Network',
  homePage: 'https://polygonscan.com/',
  blockExplorerTX: 'https://polygonscan.com/tx/[[txHash]]',
  blockExplorerAddr: 'https://polygonscan.com/address/[[address]]',
  chainID: 137,
  tokens: tokens,
  contracts: [],
  icon: matic,
  currencyName: 'MATIC',
  isEthVMSupported: {
    supported: false,
    url: null,
    websocket: null
  },
  coingeckoID: 'matic-network'
};