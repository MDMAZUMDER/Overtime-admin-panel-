import { useState, useEffect } from 'react';
import { translations, Language } from './translations';

export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'en');

  useEffect(() => {
    const handleStorage = () => {
      const currentLang = (localStorage.getItem('lang') as Language) || 'en';
      setLang(currentLang);
    };
    window.addEventListener('storage', handleStorage);
    // Also check periodically or on focus since storage event only fires for other tabs
    const interval = setInterval(handleStorage, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  return {
    t: translations[lang],
    lang,
    isRTL: lang === 'ar' || lang === 'ur'
  };
}
