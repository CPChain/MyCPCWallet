import Vue from 'vue';
import mewComponents from '@myetherwallet/mew-components';
import whiteSheet from '@/components/white-sheet/WhiteSheet.vue';
import QrCode from '@/core/components/AppQrCode.vue';

import cpcComponents from './cpc-components';

Object.keys(mewComponents).forEach(name => {
  let component = mewComponents[name];
  if (cpcComponents[name]) {
    // 如果有改动的组件，替换掉
    component = cpcComponents[name];
  }
  Vue.component(name, component);
});
Vue.component('Mew6WhiteSheet', whiteSheet);
Vue.component('QrCode', QrCode);
