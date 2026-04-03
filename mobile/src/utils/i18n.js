// i18n.js — Sets up multi-language support
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../assets/i18n/en.json';
import hi from '../assets/i18n/hi.json';

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources: {
            en: { translation: en },
            hi: { translation: hi },
        },
        lng: 'en',            // default language
        fallbackLng: 'en',    // if translation missing, use English
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;