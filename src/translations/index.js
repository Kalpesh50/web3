import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "You have a Wallet": "You have a Wallet",
      "Now what?": "Now what?",
      "Check Flash Usdt": "Check Flash Usdt",
      "Checker": "Checker",
      "Processing...": "Processing...",
      "Connected:": "Connected:",
      "Transaction Hash:": "Transaction Hash:",
      "Donated Amount:": "Donated Amount:",
      "USDT Transaction Hash:": "USDT Transaction Hash:",
      "Donated USDT Amount:": "Donated USDT Amount:",
    }
  },
  hi: {
    translation: {
      "You have a Wallet": "आपके पास एक वॉलेट है",
      "Now what?": "अब क्या?",
      "Check Flash Usdt": "फ्लैश USDT जांचें",
      "Checker": "चेकर",
      "Processing...": "प्रोसेसिंग...",
      "Connected:": "कनेक्टेड:",
      "Transaction Hash:": "लेनदेन हैश:",
      "Donated Amount:": "दान की गई राशि:",
      "USDT Transaction Hash:": "USDT लेनदेन हैश:",
      "Donated USDT Amount:": "दान की गई USDT राशि:",
    }
  },
  zh: {
    translation: {
      "You have a Wallet": "您有一个钱包",
      "Now what?": "现在怎么办？",
      "Check Flash Usdt": "检查闪电USDT",
      "Checker": "检查器",
      "Processing...": "处理中...",
      "Connected:": "已连接：",
      "Transaction Hash:": "交易哈希：",
      "Donated Amount:": "捐赠金额：",
      "USDT Transaction Hash:": "USDT交易哈希：",
      "Donated USDT Amount:": "捐赠的USDT金额：",
    }
  },
  fr: {
    translation: {
      "You have a Wallet": "Vous avez un portefeuille",
      "Now what?": "Et maintenant ?",
      "Check Flash Usdt": "Vérifier Flash USDT",
      "Checker": "Vérificateur",
      "Processing...": "Traitement en cours...",
      "Connected:": "Connecté :",
      "Transaction Hash:": "Hash de transaction :",
      "Donated Amount:": "Montant donné :",
      "USDT Transaction Hash:": "Hash de transaction USDT :",
      "Donated USDT Amount:": "Montant USDT donné :",
    }
  },
  es: {
    translation: {
      "You have a Wallet": "Tienes una billetera",
      "Now what?": "¿Y ahora qué?",
      "Check Flash Usdt": "Verificar Flash USDT",
      "Checker": "Verificador",
      "Processing...": "Procesando...",
      "Connected:": "Conectado:",
      "Transaction Hash:": "Hash de transacción:",
      "Donated Amount:": "Cantidad donada:",
      "USDT Transaction Hash:": "Hash de transacción USDT:",
      "Donated USDT Amount:": "Cantidad USDT donada:",
    }
  },
  de: {
    translation: {
      "You have a Wallet": "Sie haben ein Wallet",
      "Now what?": "Was nun?",
      "Check Flash Usdt": "Flash USDT überprüfen",
      "Checker": "Prüfer",
      "Processing...": "Verarbeitung...",
      "Connected:": "Verbunden:",
      "Transaction Hash:": "Transaktions-Hash:",
      "Donated Amount:": "Gespendeter Betrag:",
      "USDT Transaction Hash:": "USDT-Transaktions-Hash:",
      "Donated USDT Amount:": "Gespendeter USDT-Betrag:",
    }
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
