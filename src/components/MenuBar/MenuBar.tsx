/**
 * Единая чистая Панель Меню NovaCode IDE (MenuBar.tsx)
 * Все действия с файлами (Сохранить, Бэкап, Шаблоны) сгруппированы в меню File,
 * а настройки перенесены в меню Help.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  ChevronUp
} from 'lucide-react';
import type { PresetType } from '../../types/ide';
import { PRESETS_LIST } from '../../utils/presets';

interface MenuBarProps {
  onIntegrateWindows?: () => void;
  currentPreset: PresetType;
  onSelectPreset: (preset: PresetType) => void;
  onOpenFolder: () => void;
  onCreateNewFile: () => void;
  onSaveFile: () => void;
  onCreateBackup: () => void;
  onRunMacro: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  showDbViewer: boolean;
  onToggleDbViewer: () => void;
  showAiAssistant: boolean;
  onToggleAiAssistant: () => void;
  showGitPanel: boolean;
  onToggleGitPanel: () => void;
  showExplorer: boolean;
  onToggleExplorer: () => void;
  showConsole: boolean;
  onToggleConsole: () => void;
  onToggleMenuBar?: () => void;
  onOpenSettings: () => void;
  onOpenOnboarding?: () => void;
  onClearConsole: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  currentPreset,
  onSelectPreset,
  onOpenFolder,
  onCreateNewFile,
  onSaveFile,
  onCreateBackup,
  onRunMacro,
  showPreview,
  onTogglePreview,
  showDbViewer,
  onToggleDbViewer,
  showAiAssistant,
  onToggleAiAssistant,
  showGitPanel,
  onToggleGitPanel,
  showExplorer,
  onToggleExplorer,
  showConsole,
  onToggleConsole,
  onToggleMenuBar,
  onOpenSettings,
  onOpenOnboarding,
  onIntegrateWindows,
  onClearConsole
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activePresetConfig = PRESETS_LIST.find(p => p.id === currentPreset) || PRESETS_LIST[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(prev => prev === menuName ? null : menuName);
  };

  const handleAction = (action: () => void) => {
    action();
    setActiveMenu(null);
  };

  return (
    <header
      ref={menuRef}
      style={{
        height: '38px',
        background: '#090d16',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        userSelect: 'none',
        position: 'relative',
        zIndex: 100
      }}
    >
      {/* Левая секция: Логотип + Главное Меню */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '10px', fontWeight: 700, color: 'white' }}>
          <Sparkles size={16} color="#6366f1" />
          <span style={{ fontSize: '0.9rem', background: 'linear-gradient(135deg, #a855f7 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NovaCode
          </span>
        </div>

        {/* Пункты меню */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {/* File */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'file' ? 'active' : ''}`}
              onClick={() => handleMenuClick('file')}
            >
              File
            </div>
            {activeMenu === 'file' && (
              <div className="menu-dropdown">
                <div className="dropdown-item" onClick={() => handleAction(onCreateNewFile)}>
                  <span>Новый файл</span> <span className="shortcut">Ctrl+N</span>
                </div>
                <div className="dropdown-item" onClick={() => handleAction(onOpenFolder)}>
                  <span>Открыть папку...</span> <span className="shortcut">Ctrl+O</span>
                </div>
                <div className="dropdown-item" onClick={() => handleAction(onSaveFile)}>
                  <span>Сохранить</span> <span className="shortcut">Ctrl+S</span>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-item" onClick={() => handleAction(onCreateBackup)}>
                  <span>Создать Бэкап (.zip)</span>
                </div>
                <div className="dropdown-divider" />
                <div style={{ padding: '4px 14px', fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>
                  Загрузить проект по шаблону:
                </div>
                {PRESETS_LIST.map(preset => (
                  <div
                    key={preset.id}
                    className="dropdown-item"
                    onClick={() => handleAction(() => onSelectPreset(preset.id))}
                    style={{ paddingLeft: '20px' }}
                  >
                    <span>{preset.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'edit' ? 'active' : ''}`}
              onClick={() => handleMenuClick('edit')}
            >
              Edit
            </div>
            {activeMenu === 'edit' && (
              <div className="menu-dropdown">
                <div className="dropdown-item">
                  <span>Отменить</span> <span className="shortcut">Ctrl+Z</span>
                </div>
                <div className="dropdown-item">
                  <span>Повторить</span> <span className="shortcut">Ctrl+Y</span>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-item">
                  <span>Вырезать</span> <span className="shortcut">Ctrl+X</span>
                </div>
                <div className="dropdown-item">
                  <span>Копировать</span> <span className="shortcut">Ctrl+C</span>
                </div>
                <div className="dropdown-item">
                  <span>Вставить</span> <span className="shortcut">Ctrl+V</span>
                </div>
              </div>
            )}
          </div>

          {/* Selection */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'selection' ? 'active' : ''}`}
              onClick={() => handleMenuClick('selection')}
            >
              Selection
            </div>
            {activeMenu === 'selection' && (
              <div className="menu-dropdown">
                <div className="dropdown-item">
                  <span>Выделить всё</span> <span className="shortcut">Ctrl+A</span>
                </div>
              </div>
            )}
          </div>

          {/* View */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'view' ? 'active' : ''}`}
              onClick={() => handleMenuClick('view')}
            >
              View
            </div>
            {activeMenu === 'view' && (
              <div className="menu-dropdown">
                <div className="dropdown-item" onClick={() => handleAction(onToggleExplorer)}>
                  <span>{showExplorer ? '✓ ' : '  '}Explorer (Файлы)</span>
                </div>
                <div className="dropdown-item" onClick={() => handleAction(onToggleGitPanel)}>
                  <span>{showGitPanel ? '✓ ' : '  '}Git (Контроль версий)</span>
                </div>
                <div className="dropdown-item" onClick={() => handleAction(onToggleAiAssistant)}>
                  <span>{showAiAssistant ? '✓ ' : '  '}ИИ Ассистент</span>
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-item" onClick={() => handleAction(onTogglePreview)}>
                  <span>{showPreview ? '✓ ' : '  '}Live Preview</span>
                </div>
                <div className="dropdown-item" onClick={() => handleAction(onToggleDbViewer)}>
                  <span>{showDbViewer ? '✓ ' : '  '}SQL DB Viewer</span>
                </div>
                <div className="dropdown-item" onClick={() => handleAction(onToggleConsole)}>
                  <span>{showConsole ? '✓ ' : '  '}Консоль и Терминал</span>
                </div>
                <div className="dropdown-divider" />
                {onToggleMenuBar && (
                  <div className="dropdown-item" onClick={() => handleAction(onToggleMenuBar)}>
                    <span>Свернуть шапку IDE</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Go */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'go' ? 'active' : ''}`}
              onClick={() => handleMenuClick('go')}
            >
              Go
            </div>
            {activeMenu === 'go' && (
              <div className="menu-dropdown">
                <div className="dropdown-item">
                  <span>Перейти к файлу...</span> <span className="shortcut">Ctrl+P</span>
                </div>
              </div>
            )}
          </div>

          {/* Run */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'run' ? 'active' : ''}`}
              onClick={() => handleMenuClick('run')}
            >
              Run
            </div>
            {activeMenu === 'run' && (
              <div className="menu-dropdown">
                <div className="dropdown-item" onClick={() => handleAction(onRunMacro)}>
                  <Play size={14} color="#22c55e" style={{ marginRight: '6px' }} />
                  <span style={{ fontWeight: 600 }}>Запустить проект</span> <span className="shortcut">F5</span>
                </div>
              </div>
            )}
          </div>

          {/* Terminal */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'terminal' ? 'active' : ''}`}
              onClick={() => handleMenuClick('terminal')}
            >
              Terminal
            </div>
            {activeMenu === 'terminal' && (
              <div className="menu-dropdown">
                <div className="dropdown-item" onClick={() => handleAction(onClearConsole)}>
                  <span>🧹 Очистить консоль</span>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div style={{ position: 'relative' }}>
            <div
              className={`menu-bar-item ${activeMenu === 'help' ? 'active' : ''}`}
              onClick={() => handleMenuClick('help')}
            >
              Help
            </div>
            {activeMenu === 'help' && (
              <div className="menu-dropdown">
                <div className="dropdown-item" onClick={() => handleAction(onOpenSettings)}>
                  <span>⚙️ Настройки IDE</span> <span className="shortcut">Ctrl+,</span>
                </div>
                {onOpenOnboarding && (
                  <div className="dropdown-item" onClick={() => handleAction(onOpenOnboarding)}>
                    <span>👋 Экран приветствия / Онбординг</span>
                  </div>
                )}
                {onIntegrateWindows && (
                  <div className="dropdown-item" onClick={() => handleAction(onIntegrateWindows)}>
                    <span>💻 Интеграция в проводник Windows</span>
                  </div>
                )}
                <div className="dropdown-divider" />
                <div className="dropdown-item">
                  <span>ℹ️ О NovaCode IDE v1.0</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Центральная секция: Название проекта */}
      <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#94a3b8', pointerEvents: 'none', userSelect: 'none', fontWeight: 500 }}>
        NovaCode — {activePresetConfig.name}
      </div>

      {/* Правая секция: Компактные иконки */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          className="icon-btn"
          onClick={onRunMacro}
          title="Запустить проект (F5)"
          style={{ padding: '3px 8px', height: '26px', color: '#22c55e' }}
        >
          <Play size={14} fill="#22c55e" />
        </button>
        {onToggleMenuBar && (
          <button
            className="icon-btn"
            onClick={onToggleMenuBar}
            title="Свернуть верхнее меню (Шапку IDE)"
            style={{ padding: '3px 6px', height: '26px', color: 'var(--text-muted)' }}
          >
            <ChevronUp size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
