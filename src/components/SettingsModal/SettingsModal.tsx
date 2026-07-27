/**
 * Окно настроек NovaCode IDE (SettingsModal.tsx)
 * Управление автосохранением, Мульти-Провайдером ИИ-Агента (OpenAI, Anthropic, OpenRouter, Antigravity CLI, Custom/Local),
 * Экономией токенов, лимитами ответа и параметрами редактора.
 */

import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Bot,
  Key,
  Cpu,
  Zap
} from 'lucide-react';
import type { IDESettings, PresetType, AiProvider } from '../../types/ide';
import { PRESETS_LIST } from '../../utils/presets';

interface SettingsModalProps {
  settings: IDESettings;
  onUpdateSettings: (newSettings: IDESettings) => void;
  onClose: () => void;
}

// Пресеты провайдеров
const PROVIDER_DEFAULTS: Record<string, { baseUrl: string; defaultModel: string; label: string; models: string[] }> = {
  openai: {
    label: 'Формат OpenAI (OpenAI, OpenRouter, DeepSeek, Ollama...)',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    models: []
  },
  anthropic: {
    label: 'Формат Anthropic (Claude 3.5 Sonnet, Haiku...)',
    baseUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: []
  }
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'entrypoints'>('ai');

  const handleEntryPointChange = (presetId: PresetType, newPath: string) => {
    onUpdateSettings({
      ...settings,
      entryPoints: {
        ...settings.entryPoints,
        [presetId]: newPath
      }
    });
  };

  const handleProviderSelect = (provider: AiProvider) => {
    const def = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS['openai'];
    onUpdateSettings({
      ...settings,
      aiProvider: provider,
      aiBaseUrl: def.baseUrl,
      aiModel: def.defaultModel
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '650px', width: '90%' }} onClick={e => e.stopPropagation()}>
        {/* Шапка модального окна */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600 }}>
            <SettingsIcon size={20} color="#6366f1" />
            <span>Настройки NovaCode IDE</span>
          </div>
          <button className="icon-btn" onClick={onClose} title="Закрыть">
            <X size={16} />
          </button>
        </div>

        {/* Навигация по вкладкам */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
          <button
            className={`tab-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', background: activeTab === 'ai' ? 'var(--bg-app)' : 'transparent', color: activeTab === 'ai' ? 'white' : 'var(--text-muted)' }}
          >
            <Bot size={15} color="#c084fc" />
            <span>ИИ-Агент & Antigravity CLI</span>
          </button>
          <button
            className={`tab-item ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', background: activeTab === 'editor' ? 'var(--bg-app)' : 'transparent', color: activeTab === 'editor' ? 'white' : 'var(--text-muted)' }}
          >
            <SettingsIcon size={15} />
            <span>Редактор & Автосохранение</span>
          </button>
          <button
            className={`tab-item ${activeTab === 'entrypoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('entrypoints')}
            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', background: activeTab === 'entrypoints' ? 'var(--bg-app)' : 'transparent', color: activeTab === 'entrypoints' ? 'white' : 'var(--text-muted)' }}
          >
            <Cpu size={15} />
            <span>Точки входа макросов</span>
          </button>
        </div>

        {/* Содержимое вкладок */}
        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>

          {/* ВКЛАДКА 1: ИИ-АГЕНТ */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Переключатель включения ИИ */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Автономный ИИ-Ассистент</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Разрешить ИИ выполнять команды в терминале и редактировать код</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aiEnabled}
                  onChange={(e) => onUpdateSettings({ ...settings, aiEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                />
              </div>

              {/* Авто-применение без подтверждения */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(192, 132, 252, 0.1)', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={15} /> Авто-применение (Full Autonomous Access)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Вносить правки в открытый файл и запускать команды мгновенно без клика</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aiAutoApply}
                  onChange={(e) => onUpdateSettings({ ...settings, aiAutoApply: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#c084fc', cursor: 'pointer' }}
                />
              </div>

              {/* Выбор формата протокола */}
              <div>
                <label className="form-label" style={{ fontWeight: 600 }}>Формат запросов (протокол API):</label>
                <select
                  className="preset-select"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  value={settings.aiProvider === 'anthropic' ? 'anthropic' : 'openai'}
                  onChange={(e) => handleProviderSelect(e.target.value as AiProvider)}
                >
                  <option value="openai">Формат OpenAI (OpenAI, OpenRouter, DeepSeek, Ollama...)</option>
                  <option value="anthropic">Формат Anthropic (Claude 3.5 Sonnet, Haiku...)</option>
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Key size={14} color="#38bdf8" />
                  API Key (Секретный Ключ):
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="sk-... / AI..."
                  value={settings.aiApiKey}
                  onChange={(e) => onUpdateSettings({ ...settings, aiApiKey: e.target.value })}
                  style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                />
              </div>

              {/* Base URL & Model */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Base URL (Эндпоинт):</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.aiBaseUrl}
                    onChange={(e) => onUpdateSettings({ ...settings, aiBaseUrl: e.target.value })}
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  />
                </div>
                <div>
                  <label className="form-label">Модель ИИ:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.aiModel}
                    onChange={(e) => onUpdateSettings({ ...settings, aiModel: e.target.value })}
                    style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 2: РЕДАКТОР */}
          {activeTab === 'editor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Тема оформления:</label>
                  <select
                    className="preset-select"
                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                    value={settings.theme}
                    onChange={(e) => onUpdateSettings({ ...settings, theme: e.target.value as any })}
                  >
                    <option value="nova-dark">🌌 Nova Dark (Космос)</option>
                    <option value="vs-dark">🌙 VS Code Dark</option>
                    <option value="light">☀️ Nova Light (Белая тема)</option>
                    <option value="light-blue">🌊 Light Blue (Светло-голубая)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Язык интерфейса:</label>
                  <select
                    className="preset-select"
                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                    value={settings.uiLanguage}
                    onChange={(e) => onUpdateSettings({ ...settings, uiLanguage: e.target.value as any })}
                  >
                    <option value="ru">🇷🇺 Русский</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Автосохранение файлов</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Автоматически сохранять изменения в коде при вводе</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => onUpdateSettings({ ...settings, autoSave: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Размер шрифта (px):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.fontSize}
                    onChange={(e) => onUpdateSettings({ ...settings, fontSize: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Размер табуляции (пробелов):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.tabSize}
                    onChange={(e) => onUpdateSettings({ ...settings, tabSize: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 3: ТОЧКИ ВХОДА МАКРОСОВ */}
          {activeTab === 'entrypoints' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Укажите путь к главным исполняемым файлам для каждого пресета запуска:
              </div>
              {PRESETS_LIST.map(preset => (
                <div key={preset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontSize: '0.85rem', width: '180px' }}>{preset.name}:</span>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, fontFamily: 'var(--font-code)', fontSize: '0.8rem' }}
                    value={settings.entryPoints[preset.id] || preset.defaultEntryPoint}
                    onChange={(e) => handleEntryPointChange(preset.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Футер */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-panel)' }}>
          <button className="btn-primary" onClick={onClose} style={{ padding: '6px 18px' }}>
            Принять & Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
