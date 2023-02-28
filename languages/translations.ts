import AsyncStorage from '@react-native-async-storage/async-storage';
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

const getDefaultLanguage = async () => {
  const res = await AsyncStorage.getItem('@language');
  return res ?? 'en';
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      skipOnVariables: false,
    },
  })
  .then(async () => {
    await i18n.changeLanguage(await getDefaultLanguage());
  });

export const useTranslate = useTranslation;

export default i18n;
