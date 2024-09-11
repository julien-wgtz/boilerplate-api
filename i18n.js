const i18n = require('i18next');
const Backend = require('i18next-fs-backend');
const { initReactI18next } = require('react-i18next');

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en', // Langue par défaut
    backend: {
      loadPath: './locales/{{lng}}.json', // Chemin vers les fichiers de traduction
    },
    interpolation: {
      escapeValue: false, // React fait déjà l'échappement des valeurs
    },
  });

module.exports = i18n;