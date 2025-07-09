
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <Select value={language} onValueChange={(value: 'en' | 'ru' | 'he') => setLanguage(value)}>
        <SelectTrigger className="w-24 font-pixel bg-minecraft-grass/90 border-2 border-minecraft-dirt text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">🇺🇸 EN</SelectItem>
          <SelectItem value="ru">🇷🇺 RU</SelectItem>
          <SelectItem value="he">🇮🇱 עב</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
