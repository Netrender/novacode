/**
 * Нижняя строка состояния NovaCode IDE (Status Bar)
 * Отображает позицию курсора, кодировку, текущий язык и режим пресета.
 */

import React from 'react';
import type { SupportedLanguage, PresetType } from '../../types/ide';

interface StatusBarProps {
  currentLine: number;
  currentCol: number;
  language: SupportedLanguage;
  preset: PresetType;
  activeFilePath?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentLine,
  currentCol,
  language,
  preset,
  activeFilePath
}) => {
  return (
    <footer className="status-bar">
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>📍 Стр {currentLine}, Кол {currentCol}</span>
        {activeFilePath && <span>| {activeFilePath}</span>}
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>Язык: <strong>{language.toUpperCase()}</strong></span>
        <span>Кодировка: <strong>UTF-8</strong></span>
        <span>Пресет: <strong>{preset.toUpperCase()}</strong></span>
      </div>
    </footer>
  );
};
