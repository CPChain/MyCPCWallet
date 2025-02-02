import {
  Toast,
  WARNING,
  ERROR,
  SENTRY
} from '@/modules/toast/handler/handlerToast';
import Vue from 'vue';

const WalletErrorHandler = (errors, warnings) => {
  const errorValues = Object.keys(errors);
  const warningValues = Object.keys(warnings);
  return err => {
    console.error(err);
    const foundError = errorValues.find(item => {
      const message = err.message?.message || err.message;
      return message && message.includes(item);
    });
    const foundWarning = warningValues.find(item => {
      return err.message && err.message.includes(item);
    });
    if (foundError) {
      Toast(Vue.$i18n.t(errors[foundError]), {}, ERROR);
    } else if (foundWarning) {
      Toast(Vue.$i18n.t(warnings[foundWarning]), {}, WARNING);
    } else {
      Toast(err, {}, SENTRY);
    }
  };
};
export default WalletErrorHandler;
