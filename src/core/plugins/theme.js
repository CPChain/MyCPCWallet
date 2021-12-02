// MEW colors: https://myetherwallet.github.io/mew-components/?path=/docs/mewcolors--all
// 采用 Ant-Design Daybreak Blue / 拂晓蓝 (https://ant.design/docs/spec/colors-cn)
const primaryHover = '#1eb19b';
const primary = '#05c0a5';
const primaryActive = '#56c5b4';
const superPrimaryHover = '#f5fdfb';
// 首页背景色
const expandHeader = '#002766'; // '#184f90';

// 不去动代码，直接把 green 的改下
// const greenPrimary = '#096dd9';
// const greenMedium = '#C3F0E9';
// const greenLight = '#EBFAF8';
const greenPrimary = '#40a9ff';
const greenMedium = '#91d5ff';
const greenLight = '#e6f7ff';

export default {
  icons: {
    iconfont: 'mdi'
  },
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        // new colors
        backgroundWallet: '#F2F4FA',
        backgroundOverlay: '#F2FAFA',
        backgroundGrey: '#F8F9FB',
        whiteAlways: '#FFFFFF',
        whiteBackground: '#FFFFFF',
        whitePopup: '#FFFFFF',
        textDark: '#192133',
        textMedium: '#5A678A',
        textLight: '#939FB9',
        greyPrimary: '#5A678A',
        greyMedium: '#D7DAE3',
        greyLight: '#F2F3F6',
        greenPrimary: greenPrimary,
        greenMedium: greenMedium,
        greenLight: greenLight,
        bluePrimary: '#4B83E8',
        blueMedium: '#D4E1F9',
        blueLight: '#EEF3FD',
        redPrimary: '#FF445B',
        redMedium: '#FFD2D8',
        redLight: '#FFF0F2',
        orangePrimary: '#F5A623',
        orangeMedium: '#FBDBA7',
        orangeLight: '#FEF4E5',
        disabledPrimary: '#CECECE',
        disabledMedium: '#E0E0E0',
        disabledLight: '#F6F6F6',
        //old colors
        primaryHover: primaryHover,
        primaryActive: primaryActive,
        primaryOutlineActive: '#baede6',
        secondaryOutlineActive: '#d6dffa',
        errorOutlineActive: '#ffd7dc',
        basicOutlineActive: '#c5ccd3',
        selectActive: '#dcfff9',
        selectHover: '#E5EAEE',
        superPrimary: {
          base: '#f2fafa',
          darken1: '#e3f2f2'
        },
        superPrimaryHover: superPrimaryHover,
        emerald100: '#f2fafa',
        inputBorder: '#e0e0e0',
        inputDisabled: '#cecece',
        dropdownBorder: '#05c0a5',
        progressBar: '#F3FAFA',
        txIn: '#7895f2',
        txOut: '#ffaf8f',
        swap: '#7fdefb',
        swapDisable: '#f8f8f8',
        captionPrimary: '#a9bcd2',
        textSecondary: '#999999',
        textSecondaryModule: '#999999',
        tagLabel: '#6d89a6',
        inputLabel: '#6d89a6',
        searchInput: '#f2f4fa',
        searchText: '#96a8b6',
        titlePrimary: '#0b2840',
        titleSecondary: '#4E5A6E',
        textPrimary: '#707D9E',
        textPrimaryModule: '#667f9b',
        white: '#fff',
        black: '#000',
        mewBg: '#fff',
        walletBg: '#f2f4fa',
        boxShadow: '#ececec',
        expandHeader: expandHeader,
        primary: primary,
        blue500: '#5a78f0',
        basic: '#0b1a40',
        success: '#2cc479',
        error: {
          base: '#ff445b',
          lighten1: '#ffd7dc',
          lighten2: '#e96071'
        },
        warning: {
          base: '#FFF2DC',
          darken1: '#f5a623',
          darken2: '#ff7700'
        },
        disabled: '#cecece',
        tableHeader: '#f9f9f9',
        selectHeaderBg: '#F8FAFC',
        selectBorder: '#F1F1F1',
        maxButton: '#F6F8FD',
        textBlack: '#202124',
        textBlack2: '#5F6368',
        buttonSelect: '#D7F5F4',
        blue100: '#F3F5FB',
        surface: '#192133' // name from figma. not sure if its correct
      },
      dark: {
        // new colors
        backgroundWallet: '#F2F4FA',
        backgroundOverlay: '#F2FAFA',
        backgroundGrey: '#F8F9FB',
        whiteAlways: '#FFFFFF',
        whiteBackground: '#FFFFFF',
        whitePopup: '#FFFFFF',
        textDark: '#192133',
        textMedium: '#5A678A',
        textLight: '#939FB9',
        greyPrimary: '#5A678A',
        greyMedium: '#D7DAE3',
        greyLight: '#F2F3F6',
        greenPrimary: greenPrimary,
        greenMedium: greenMedium,
        greenLight: greenLight,
        bluePrimary: '#4B83E8',
        blueMedium: '#D4E1F9',
        blueLight: '#EEF3FD',
        redPrimary: '#FF445B',
        redMedium: '#FFD2D8',
        redLight: '#FFF0F2',
        orangePrimary: '#F5A623',
        orangeMedium: '#FBDBA7',
        orangeLight: '#FEF4E5',
        disabledPrimary: '#CECECE',
        disabledMedium: '#E0E0E0',
        disabledLight: '#F6F6F6',
        //old colors
        primaryHover: primaryHover,
        primaryActive: primaryActive,
        primaryOutlineHover: '#03292c',
        primaryOutlineActive: '#15796a',
        secondaryOutlineHover: '#182040',
        secondaryOutlineActive: '#2e3c75',
        errorOutlineHover: '#361317',
        errorOutlineActive: '#651f28',
        basicOutlineHover: '#1e2a3e',
        basicOutlineActive: '#3d4e6b',
        selectActive: '#2e3c75',
        selectHover: '#2c3448',
        superPrimary: {
          base: '#242c48',
          darken1: '#e3f2f2'
        },
        superPrimaryHover: superPrimaryHover,
        emerald100: '#151a29',
        inputBorder: '#667f9b',
        inputDisabled: '#3A465D',
        dropdownBorder: '#7e90a7',
        progressBar: '#151A29',
        txIn: '#7895f2',
        txOut: '#ffaf8f',
        swap: '#0f1320',
        swapDisable: '#0f1320',
        captionPrimary: '#a9bcd2',
        textSecondary: '#999999',
        inputLabel: '#4e5a6e',
        tagLabel: '#95aed8',
        searchInput: '#f2f4fa',
        searchText: '#96a8b6',
        white: '#fff',
        mewBg: '#151a29',
        walletBg: '#151a29',
        black: '#000',
        boxShadow: '#3c3c3c',
        expandHeader: expandHeader,
        titlePrimary: '#95aed8',
        titleSecondary: '#4E5A6E',
        textPrimary: '#707D9E',
        textPrimaryModule: '#95aed8',
        textSecondaryModule: '#95aed8',
        primary: primary,
        blue500: '#5c79f0',
        basic: '#151A29',
        success: '#2cc479',
        error: {
          base: '#ff445b',
          lighten1: '#ffd7dc',
          lighten2: '#e96071'
        },
        warning: {
          base: '#0f1320',
          darken1: '#f5a623'
        },
        disabled: '#1f2b42',
        tableHeader: '#0f1320',
        selectHeaderBg: '#F8FAFC',
        selectBorder: '#F1F1F1',
        maxButton: '#F6F8FD',
        textBlack: '#202124',
        textBlack2: '#5F6368',
        buttonSelect: '#D7F5F4',
        blue100: '#F3F5FB',
        surface: '#192133' //name from figma
      }
    }
  }
};