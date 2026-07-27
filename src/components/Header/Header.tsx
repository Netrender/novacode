/**
 * Шапка NovaCode IDE (Header.tsx)
 * Содержит логотип, выбор пресета, кнопку макроса «Запустить», 
 * кнопки создание бэкапа, запуск ИИ-Ассистента, Git, Live Preview, SQL DB и Настройки.
 */

import React from 'react';
import { 
  Play, 
  Settings, 
  Database, 
  Eye, 
  Layers, 
  Atom, 
  Code2, 
  Component, 
  ShieldCheck, 
  Smartphone, 
  Cpu, 
  Terminal,
  Sparkles,
  Archive,
  Bot,
  GitBranch,
  Save
} from 'lucide-react';
import type { PresetType } from '../../types/ide';
import { PRESETS_LIST } from '../../utils/presets';

interface HeaderProps {
  currentPreset: PresetType;
  onSelectPreset: (preset: PresetType) => void;
  onRunMacro: () => void;
  onSaveActiveFile: () => void;
  onCreateBackup: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  showDbViewer: boolean;
  onToggleDbViewer: () => void;
  showAiAssistant: boolean;
  onToggleAiAssistant: () => void;
  showGitPanel: boolean;
  onToggleGitPanel: () => void;
  onOpenSettings: () => void;
}

// Функция подбора иконки по имени
function renderPresetIcon(iconName: string) {
  switch (iconName) {
    case 'Layers': return <Layers size={16} color="#a855f7" />;
    case 'Atom': return <Atom size={16} color="#61dafb" />;
    case 'Code2': return <Code2 size={16} color="#ec4899" />;
    case 'Component': return <Component size={16} color="#4ade80" />;
    case 'ShieldCode': return <ShieldCheck size={16} color="#dd1b16" />;
    case 'Smartphone': return <Smartphone size={16} color="#38bdf8" />;
    case 'Cpu': return <Cpu size={16} color="#f97316" />;
    case 'Terminal': return <Terminal size={16} color="#34d399" />;
    default: return <Sparkles size={16} color="#6366f1" />;
  }
}

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  onRunMacro,
  onSaveActiveFile,
  onCreateBackup,
  showPreview,
  onTogglePreview,
  showDbViewer,
  onToggleDbViewer,
  showAiAssistant,
  onToggleAiAssistant,
  showGitPanel,
  onToggleGitPanel,
  onOpenSettings
}) => {
  const activePresetConfig = PRESETS_LIST.find(p => p.id === currentPreset) || PRESETS_LIST[0];

  return (
    <header className="ide-header">
      {/* Логотип приложения */}
      <div className="ide-logo">
        <Sparkles size={22} color="#6366f1" />
        <span>NovaCode IDE</span>
      </div>

      {/* Выбор пресета и Кнопки управления */}
      <div className="ide-header-center">
        <div className="preset-select-wrapper">
          {renderPresetIcon(activePresetConfig.iconName)}
          <select 
            className="preset-select"
            value={currentPreset}
            onChange={(e) => onSelectPreset(e.target.value as PresetType)}
          >
            {PRESETS_LIST.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Динамическая кнопка макроса «Запустить» */}
        <button 
          className="btn-run-macro"
          onClick={onRunMacro}
          title={activePresetConfig.description}
        >
          <Play size={16} fill="white" />
          <span>Запустить</span>
        </button>

        {/* Кнопка ручного сохранения файла */}
        <button
          className="icon-btn"
          onClick={onSaveActiveFile}
          title="Сохранить текущий файл (Ctrl+S)"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}
        >
          <Save size={15} color="#4ade80" />
          <span>Сохранить</span>
        </button>

        {/* Кнопка создания резервной копии */}
        <button
          className="icon-btn"
          onClick={onCreateBackup}
          title="Создать полный бэкап проекта (.zip)"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: '#fbbf24' }}
        >
          <Archive size={15} color="#fbbf24" />
          <span>Бэкап</span>
        </button>
      </div>

      {/* Кнопки переключения панелей и настроек */}
      <div className="ide-header-right">
        <button 
          className={`icon-btn ${showGitPanel ? 'active' : ''}`}
          onClick={onToggleGitPanel}
          title="Панель Git версионирования"
        >
          <GitBranch size={16} />
          <span>Git</span>
        </button>

        <button 
          className={`icon-btn ${showAiAssistant ? 'active' : ''}`}
          onClick={onToggleAiAssistant}
          title="Встроенный ИИ-Ассистент"
        >
          <Bot size={16} />
          <span>ИИ</span>
        </button>

        <button 
          className={`icon-btn ${showPreview ? 'active' : ''}`}
          onClick={onTogglePreview}
          title="Интерактивный Live Preview"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>

        <button 
          className={`icon-btn ${showDbViewer ? 'active' : ''}`}
          onClick={onToggleDbViewer}
          title="Визуальный просмотрщик SQL баз данных"
        >
          <Database size={16} />
          <span>SQL DB</span>
        </button>

        <button 
          className="icon-btn"
          onClick={onOpenSettings}
          title="Настройки IDE, ИИ и параметров"
        >
          <Settings size={16} />
          <span>Настройки</span>
        </button>
      </div>
    </header>
  );
};
