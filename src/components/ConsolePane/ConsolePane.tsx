/**
 * Панель вывода консоли и Интерактивный Терминал (ConsolePane.tsx)
 * Выводит `console.log`, результаты компиляции и поддерживает реальный интерактивный ввод команд терминала.
 */

import React, { useState } from 'react';
import { Terminal, Trash2, ShieldAlert, Play, X, Copy, ClipboardPaste } from 'lucide-react';
import type { ConsoleMessage } from '../../types/ide';

interface ConsolePaneProps {
  messages: ConsoleMessage[];
  onClearConsole: () => void;
  onRunTerminalCommand: (cmd: string) => void;
  onClose?: () => void;
  height?: number;
}

export const ConsolePane: React.FC<ConsolePaneProps> = ({
  messages,
  onClearConsole,
  onRunTerminalCommand,
  onClose,
  height
}) => {
  const [terminalInput, setTerminalInput] = useState('');

  const handleExecuteCommand = () => {
    if (!terminalInput.trim()) return;
    onRunTerminalCommand(terminalInput.trim());
    setTerminalInput('');
  };

  const getClipboardText = async (): Promise<string> => {
    try {
      if (typeof window !== 'undefined' && (window as any).require) {
        const { clipboard } = (window as any).require('electron');
        const text = clipboard.readText();
        if (text) return text;
      }
    } catch (err) {}
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      console.error('Ошибка чтения буфера:', err);
      return '';
    }
  };

  const writeClipboardText = async (text: string) => {
    try {
      if (typeof window !== 'undefined' && (window as any).require) {
        const { clipboard } = (window as any).require('electron');
        clipboard.writeText(text);
        return;
      }
    } catch (err) {}
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Ошибка записи в буфер:', err);
    }
  };

  const handleCopy = () => {
    let textToCopy = window.getSelection()?.toString();
    if (!textToCopy) {
      textToCopy = messages.map(m => `[${m.timestamp}] ${m.message}`).join('\n');
    }
    if (textToCopy) {
      writeClipboardText(textToCopy);
    }
  };

  const handlePaste = async () => {
    const text = await getClipboardText();
    if (text) {
      setTerminalInput(prev => prev + text);
    }
  };

  return (
    <div 
      className="console-pane" 
      style={{ height: height ? `${height}px` : undefined }}
    >
      {/* Шапка консоли */}
      <div className="console-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Terminal size={14} color="#6366f1" />
          <span>Консоль вывода & Терминал (Output & Terminal)</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className="icon-btn" 
            style={{ padding: '2px 6px' }}
            onClick={handleCopy}
            title="Копировать выделенное (или все логи)"
          >
            <Copy size={13} />
            <span>Копировать</span>
          </button>
          <button 
            className="icon-btn" 
            style={{ padding: '2px 6px' }}
            onClick={handlePaste}
            title="Вставить из буфера в терминал"
          >
            <ClipboardPaste size={13} />
            <span>Вставить</span>
          </button>
          <button 
            className="icon-btn" 
            style={{ padding: '2px 6px' }}
            onClick={onClearConsole}
            title="Очистить консоль"
          >
            <Trash2 size={13} />
            <span>Очистить</span>
          </button>
          {onClose && (
            <button 
              className="icon-btn" 
              style={{ padding: '2px 4px' }}
              onClick={onClose}
              title="Свернуть консоль"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Список логов */}
      <div className="console-body">
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Консоль пуста. Запустите макрос или введите команду терминала ниже (например, git status или npm run dev).
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`console-line ${msg.type}`}>
              <span style={{ color: 'var(--text-muted)' }}>[{msg.timestamp}]</span>
              {msg.type === 'error' && <ShieldAlert size={14} color="#ef4444" />}
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Поле интерактивного ввода команд терминала PowerShell */}
      <div style={{ padding: '6px 12px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', fontWeight: 'bold', fontSize: '0.85rem' }}>PS &gt;</span>
        <input 
          type="text"
          className="form-input"
          style={{ fontFamily: 'var(--font-code)', fontSize: '0.85rem', padding: '4px 8px', background: 'var(--bg-app)' }}
          placeholder="PowerShell: git status, dir, g++ main.cpp, npm test..."
          value={terminalInput}
          onChange={(e) => setTerminalInput(e.target.value)}
          onPaste={async (e) => {
            e.preventDefault();
            let text = e.clipboardData?.getData('text');
            if (!text) {
              text = await getClipboardText();
            }
            if (text) {
              const inputEl = e.target as HTMLInputElement;
              const start = inputEl.selectionStart || 0;
              const end = inputEl.selectionEnd || 0;
              const newVal = terminalInput.substring(0, start) + text + terminalInput.substring(end);
              setTerminalInput(newVal);
              setTimeout(() => {
                inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
              }, 0);
            }
          }}
          onKeyDown={async (e) => { 
            if (e.key === 'Enter') {
              handleExecuteCommand();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
              e.preventDefault();
              const text = await getClipboardText();
              if (text) {
                const inputEl = e.target as HTMLInputElement;
                const start = inputEl.selectionStart || 0;
                const end = inputEl.selectionEnd || 0;
                const newVal = terminalInput.substring(0, start) + text + terminalInput.substring(end);
                setTerminalInput(newVal);
                setTimeout(() => {
                  inputEl.selectionStart = inputEl.selectionEnd = start + text.length;
                }, 0);
              }
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
              const selection = window.getSelection()?.toString();
              if (selection) {
                writeClipboardText(selection);
              } else {
                const inputEl = e.target as HTMLInputElement;
                if (inputEl.selectionStart !== inputEl.selectionEnd) {
                  const inputSel = terminalInput.substring(inputEl.selectionStart || 0, inputEl.selectionEnd || 0);
                  writeClipboardText(inputSel);
                }
              }
            }
          }}
        />
        <button 
          className="btn-primary" 
          style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={handleExecuteCommand}
        >
          <Play size={12} /> Выполнить
        </button>
      </div>
    </div>
  );
};
