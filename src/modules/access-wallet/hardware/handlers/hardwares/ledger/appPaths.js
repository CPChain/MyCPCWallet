import { CPC } from '@/utils/networks/types';

const cpcMainnet = {
  path: "m/44'/337'/0'/0",
  label: 'CPChain Mainnet'
};

const appList = [
  {
    network: CPC,
    paths: [cpcMainnet]
  }
];
export default appList;
