import cpchain from '@/assets/images/networks/cpchain.svg';

export default {
  name: 'CPC',
  name_long: 'CPChain',
  homePage: 'https://cpchain.io',
  blockExplorerTX: 'https://cpchain.io/#/explorer/tx/[[txHash]]',
  blockExplorerAddr: 'https://cpchain.io/#/explorer/address/[[address]]',
  chainID: 337,
  tokens: [],
  contracts: [],
  isTestNetwork: false,
  // ens: {
  //   registry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  //   registrarTLD: 'eth',
  //   registrarType: 'permanent',
  //   supportedTld: GOERLI,
  //   subgraphPath: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'
  // },
  icon: cpchain,
  currencyName: 'CPC',
  isEthVMSupported: {
    supported: false,
    url: 'http://api.ethvm.com/',
    blockExplorerTX: 'https://ethvm.com/tx/[[txHash]]',
    blockExplorerAddr: 'https://ethvm.com/address/[[address]]',
    websocket: null
  },
  gasPriceMultiplier: 1,
  coingeckoID: 'cpchain'
};
