import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from "i18next-browser-languagedetector";

import en from './i18n/en.json';
import es from './i18n/es.json';
import pt from './i18n/pt.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  pt: {
	translation: pt,
  },
} as const;

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
	detection: {
		order: ["localStorage", "navigator"],
		caches: ["localStorage"],
	}
  });

export default i18next;
