/**
 * Менеджер сохранения и загрузки настроек NovaCode IDE (storage.ts)
 * Сохраняет настройки пользователя (API Ключи, Провайдеры ИИ, Antigravity CLI статус, Автосохранение)
 * в localStorage и локальный системный файл конфигурации novacode-settings.json.
 */

import type { IDESettings } from '../types/ide';

const STORAGE_KEY = 'novacode_ide_settings_v1';

export const DEFAULT_SETTINGS: IDESettings = {
  theme: 'nova-dark',
  uiLanguage: 'ru',
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  tabSize: 2,
  autoSave: false,
  showLineNumbers: true,
  hasSeenOnboarding: false,
  entryPoints: {
    custom: 'index.html',
    fullstack: 'server/server.js',
    react: 'src/App.tsx',
    frontend_vanilla: 'index.html',
    vue: 'src/App.vue',
    angular: 'src/app.component.ts',
    pwa: 'index.html',
    rust: 'src/main.rs',
    cpp: 'src/main.cpp'
  },
  aiEnabled: true,
  aiProvider: 'gemini',
  aiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  aiBaseUrl: 'https://generativelanguage.googleapis.com',
  aiModel: 'gemini-2.5-pro',
  aiMaxTokens: 2048,
  aiEconomyMode: true,
  aiAutoApply: false
};

// Загрузка сохраненных настроек (синхронная из localStorage)
export function loadSavedSettings(): IDESettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

// Асинхронная загрузка (в Electron читает из novacode-settings.json)
export async function loadSavedSettingsAsync(): Promise<IDESettings> {
  try {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const fileSettings = await ipcRenderer.invoke('settings:loadFromFile');
        if (fileSettings && typeof fileSettings === 'object') {
          const merged = { ...DEFAULT_SETTINGS, ...fileSettings };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      } catch (err) {
        // Игнорируем ошибку чтения файла
      }
    }
  } catch (e) {
    console.error('Failed to load settings from file:', e);
  }
  return loadSavedSettings();
}

// Сохранение настроек при изменении
export function saveSettings(settings: IDESettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Если запущено в Electron, пишем также в нативный файл конфигурации
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        ipcRenderer.invoke('settings:saveToFile', settings);
      } catch (err) {
        // Игнорируем в веб-версии
      }
    }
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
