/**
 * Движок редактора кода NovaCode IDE
 * Использует локальный скомпилированный движок без вызовов внешних CDN сетей.
 */

import React, { useRef } from 'react';
import Editor, { loader, type OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { emmetHTML, emmetCSS, emmetJSX } from 'emmet-monaco-es';
import type { SupportedLanguage } from '../../types/ide';

// Подключаем локальный экземпляр Monaco из пакета, минуя задержки и CDN
loader.config({ monaco });

interface CodeEditorProps {
  content: string;
  language: SupportedLanguage;
  onChange: (newContent: string) => void;
  onCursorPositionChange?: (line: number, col: number) => void;
  theme?: string;
  fontSize?: number;
  fontFamily?: string;
  tabSize?: number;
}

// Преобразование внешнего идентификатора языка в формат редактора
const mapLanguageToMonaco = (lang: SupportedLanguage): string => {
  switch (lang) {
    case 'javascript': return 'javascript';
    case 'typescript': return 'typescript';
    case 'jsx': return 'javascript';
    case 'tsx': return 'typescript';
    case 'html': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    case 'sql': return 'sql';
    case 'rust': return 'rust';
    case 'cpp': return 'cpp';
    case 'vue': return 'html';
    case 'markdown': return 'markdown';
    default: return 'javascript';
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  content,
  language,
  onChange,
  onCursorPositionChange,
  theme = 'nova-dark',
  fontSize = 14,
  fontFamily = "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  tabSize = 2
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, instance) => {
    editorRef.current = editor;

    // Регистрация фирменной тёмной темы Nova Dark
    instance.editor.defineTheme('nova-dark-monaco', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', background: '090d16', foreground: 'e2e8f0' },
        { token: 'keyword', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'keyword.rust', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'keyword.cpp', foreground: 'c084fc', fontStyle: 'bold' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'string', foreground: '4ade80' },
        { token: 'number', foreground: 'f97316' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'tag', foreground: 'ec4899' },
        { token: 'attribute.name', foreground: 'fbbf24' }
      ],
      colors: {
        'editor.background': '#090d16',
        'editor.foreground': '#e2e8f0',
        'editor.lineHighlightBackground': '#1e293b44',
        'editorCursor.foreground': '#6366f1',
        'editorWhitespace.foreground': '#334155',
        'editorIndentGuide.background': '#1e293b',
        'editorIndentGuide.activeBackground': '#475569',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#a855f7',
        'editor.selectionBackground': '#3b82f644',
        'editor.inactiveSelectionBackground': '#3b82f622'
      }
    });

    // Регистрация светлой темы Nova Light (Белая тема)
    instance.editor.defineTheme('nova-light-monaco', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', background: 'ffffff', foreground: '1e293b' },
        { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
        { token: 'type', foreground: '0284c7' },
        { token: 'string', foreground: '16a34a' },
        { token: 'number', foreground: 'ea580c' },
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'function', foreground: '2563eb' },
        { token: 'tag', foreground: 'db2777' },
        { token: 'attribute.name', foreground: 'd97706' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#1e293b',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorCursor.foreground': '#6366f1',
        'editorWhitespace.foreground': '#cbd5e1',
        'editorIndentGuide.background': '#e2e8f0',
        'editorIndentGuide.activeBackground': '#94a3b8',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#7c3aed',
        'editor.selectionBackground': '#3b82f633',
        'editor.inactiveSelectionBackground': '#3b82f618'
      }
    });

    const monacoTheme = theme === 'light' || theme === 'light-blue' ? 'nova-light-monaco' : theme === 'vs-dark' ? 'vs-dark' : 'nova-dark-monaco';
    instance.editor.setTheme(monacoTheme);

    // Отслеживание движения курсора для Status Bar
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorPositionChange) {
        onCursorPositionChange(e.position.lineNumber, e.position.column);
      }
    });

    // Инициализация Emmet
    try {
      emmetHTML(monaco);
      emmetCSS(monaco);
      emmetJSX(monaco);
    } catch (e) {
      console.warn('Emmet initialization error:', e);
    }

    // Явная привязка Ctrl+V / Cmd+V (Вставка из буфера)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text !== undefined && text !== null) {
          const selection = editor.getSelection();
          if (selection) {
            editor.executeEdits('clipboard', [{ range: selection, text, forceMoveMarkers: true }]);
            editor.focus();
          }
        }
      } catch (err) {
        console.error('Failed to paste via Clipboard API:', err);
      }
    });

    // Явная привязка Ctrl+C / Cmd+C (Копирование)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, async () => {
      try {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const text = editor.getModel()?.getValueInRange(selection);
          if (text) await navigator.clipboard.writeText(text);
        }
      } catch (err) {
        console.error('Failed to copy via Clipboard API:', err);
      }
    });

    // Явная привязка Ctrl+X / Cmd+X (Вырезание)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, async () => {
      try {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const text = editor.getModel()?.getValueInRange(selection);
          if (text) {
            await navigator.clipboard.writeText(text);
            editor.executeEdits('clipboard', [{ range: selection, text: '', forceMoveMarkers: true }]);
            editor.focus();
          }
        }
      } catch (err) {
        console.error('Failed to cut via Clipboard API:', err);
      }
    });
  };

  const monacoThemeName = theme === 'light' || theme === 'light-blue' ? 'nova-light-monaco' : theme === 'vs-dark' ? 'vs-dark' : 'nova-dark-monaco';
  const bgHex = theme === 'light' || theme === 'light-blue' ? '#ffffff' : '#090d16';

  return (
    <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', background: bgHex }}>
      <Editor
        height="100%"
        width="100%"
        language={mapLanguageToMonaco(language || 'javascript')}
        value={content || ''}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme={monacoThemeName}
        loading={<div style={{ color: '#94a3b8', padding: '20px', fontSize: '13px' }}>Загрузка редактора NovaCode...</div>}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: fontSize,
          fontFamily: fontFamily,
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          lineNumbersMinChars: 3,
          padding: { top: 12, bottom: 12 },
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          renderLineHighlight: 'all',
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          tabSize: tabSize,
          contextmenu: true
        }}
      />
    </div>
  );
};
