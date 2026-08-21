import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/utils/translations';

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: keyof typeof translations.fr): string => {
    return translations[language][key] || key;
  };

  return { t, language };
}
