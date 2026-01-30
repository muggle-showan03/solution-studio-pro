import { Language } from '@/types/problem';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  selected: Language;
  onSelect: (language: Language) => void;
}

const languages: { id: Language; name: string; icon: string }[] = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'cpp', name: 'C++', icon: '⚡' },
  { id: 'java', name: 'Java', icon: '☕' },
];

export function LanguageSelector({ selected, onSelect }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelect(lang.id)}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
            'flex items-center gap-2',
            selected === lang.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          <span>{lang.icon}</span>
          <span>{lang.name}</span>
        </button>
      ))}
    </div>
  );
}
