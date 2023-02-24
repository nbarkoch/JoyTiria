import i18n from 'i18next';
import {initReactI18next, useTranslation} from 'react-i18next';
import english from './en.json';
import hebrew from './he.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: english,
      he: hebrew,
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const useTranslate = useTranslation;

export default useTranslate;
