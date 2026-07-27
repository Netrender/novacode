/**
 * Типы и интерфейсы для NovaCode IDE
 * Описывают структуру данных, ИИ-Агента, провайдеров API и интеграцию с Antigravity CLI.
 */

// Поддерживаемые языки программирования в IDE
export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'jsx' 
  | 'tsx' 
  | 'html' 
  | 'css' 
  | 'json' 
  | 'sql' 
  | 'rust' 
  | 'cpp' 
  | 'vue' 
  | 'markdown';

// Идентификаторы пресетов разработки
export type PresetType = 
  | 'custom'
  | 'fullstack' 
  | 'frontend_vanilla' 
  | 'react' 
  | 'vue' 
  | 'angular' 
  | 'pwa' 
  | 'rust' 
  | 'cpp';

// Категории пресетов
export type PresetCategory = 'frontend' | 'fullstack' | 'pwa' | 'native' | 'custom';

// Конфигурация пресета запуска
export interface PresetConfig {
  id: PresetType;
  name: string;
  category: PresetCategory;
  description: string;
  defaultEntryPoint: string;
  iconName: string;
  runCommandLabel: string;
}

// Элемент дерева файлов (Файл или Папка)
export interface FileNode {
  id: string;
  name: string;
  path: string;
  content?: string;
  language?: SupportedLanguage;
  isFolder: boolean;
  isOpen?: boolean;
  children?: FileNode[];
  parentId?: string | null;
}

// Открытая вкладка редактора
export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  path: string;
  language: SupportedLanguage;
  content: string;
  isDirty: boolean;
}

// Запись лога в консоли IDE
export interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'system';
  message: string;
  timestamp: string;
  source?: string;
}

// Элемент резервной копии проекта (Backup)
export interface BackupItem {
  id: string;
  timestamp: string;
  name: string;
  fileCount: number;
  files: FileNode[];
}

// Вызов инструмента ИИ-Агентом
export interface AiToolCall {
  id: string;
  type: 'editFile' | 'createFile' | 'runCommand' | 'readFile';
  filePath?: string;
  content?: string;
  command?: string;
  status: 'pending' | 'executed' | 'cancelled';
}

// Сообщение встроенного ИИ-Ассистента
export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string;
  timestamp: string;
  toolCall?: AiToolCall;
}

// Провайдеры ИИ
export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'custom';

// Состояние файла в системе Git
export interface GitStatusItem {
  path: string;
  status: 'M' | 'A' | 'D' | '?' | 'U';
}

// Таблица SQL базы данных
export interface SqlColumn {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
}

export interface SqlTable {
  name: string;
  columns: SqlColumn[];
  rows: Record<string, any>[];
}

export interface SqlDatabase {
  name: string;
  tables: SqlTable[];
}

// Настройки пользователя IDE
export interface IDESettings {
  theme: 'nova-dark' | 'vs-dark' | 'light' | 'light-blue';
  uiLanguage: 'ru' | 'en';
  fontSize: number;
  fontFamily?: string;
  tabSize: number;
  autoSave: boolean;
  showLineNumbers: boolean;
  hasSeenOnboarding?: boolean;
  entryPoints: Record<PresetType, string>;
  
  // Конфигурация ИИ-Ассистента
  aiEnabled: boolean;
  aiProvider: AiProvider;
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  aiMaxTokens: number;
  aiEconomyMode: boolean; // Режим экономии токенов
  aiAutoApply: boolean; // Автоматическое применение изменений
}

// Элемент автодополнения (IntelliSense)
export interface AutocompleteItem {
  label: string;
  insertText: string;
  kind: 'keyword' | 'tag' | 'property' | 'function' | 'snippet' | 'variable';
  detail?: string;
  documentation?: string;
}
