import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex justify-center">
      <Select value={language} onValueChange={(value: 'fr' | 'en') => setLanguage(value)}>
        <SelectTrigger className="w-[140px] h-8 text-sm border-muted-foreground/30 bg-background/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fr">🇫🇷 Français</SelectItem>
          <SelectItem value="en">🇬🇧 English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
