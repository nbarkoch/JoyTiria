import i18n from 'i18next';
import {initReactI18next, useTranslation} from 'react-i18next';
import english from './en.json';
import hebrew from './he.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources['en'];
  }
}

export const defaultNS = 'en';
export const resources = {
  en: english,
  he: hebrew,
} as const;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      skipOnVariables: false,
    },
  });

export const useTranslate = useTranslation;

export default i18n;
