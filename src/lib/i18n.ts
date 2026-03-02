import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources loaded from JSON files
import enTranslation from '../locales/en/translation.json';
import roTranslation from '../locales/ro/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  ro: {
    translation: roTranslation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ro', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
