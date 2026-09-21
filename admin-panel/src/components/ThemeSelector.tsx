'use client';

import { useTheme } from './ThemeProvider';
import { Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { name: 'Bleu', value: 'blue', color: 'bg-blue-600' },
    { name: 'Gris', value: 'gray', color: 'bg-gray-600' },
    { name: 'Sombre', value: 'dark', color: 'bg-gray-900' },
    { name: 'Vert', value: 'green', color: 'bg-green-600' },
    { name: 'Violet', value: 'purple', color: 'bg-purple-600' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-600' },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
        <Palette className="w-5 h-5" />
        <span>Thème</span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-2">Choisir un thème</p>
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                theme === t.value ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${t.color}`} />
              <span className="text-gray-700">{t.name}</span>
              {theme === t.value && (
                <span className="ml-auto text-gray-500">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
