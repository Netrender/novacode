/**
 * Компонент Live Preview (Интерактивный предпросмотр веб-страницы в реальном времени)
 * Поддерживает автообновление при изменении кода и перехватывает console.log в консоль IDE.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import type { FileNode } from '../../types/ide';

interface LivePreviewProps {
  files: FileNode[];
  activeFile?: { name: string; content: string } | null;
  onLogMessage: (type: 'log' | 'warn' | 'error', msg: string) => void;
  onSelectFile?: (file: FileNode) => void;
  onClose?: () => void;
  width?: number;
}

// Вспомогательная функция для рекурсивного сбора всех файлов из папок
const getAllFiles = (nodes: FileNode[]): FileNode[] => {
  let result: FileNode[] = [];
  for (const node of nodes) {
    if (node.isFolder && node.children) {
      result = result.concat(getAllFiles(node.children));
    } else if (!node.isFolder) {
      result.push(node);
    }
  }
  return result;
};

export const LivePreview: React.FC<LivePreviewProps> = ({ files, activeFile, onLogMessage, onSelectFile, onClose, width }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Сборка финального HTML содержимого для iframe
  const generatePreviewHTML = useCallback((): string => {
    const defaultPlaceholder = `
      <div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 85vh; color: #64748b; background: #090d16; text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 12px;">🚀</div>
        <h3 style="color: #f8fafc; margin-bottom: 8px; font-size: 18px;">Native / Terminal Environment</h3>
        <p style="font-size: 13px; max-width: 380px; color: #94a3b8; line-height: 1.5;">
          Нажмите кнопку <b>«Запустить»</b> в шапке IDE для компиляции и вывода результатов в консоль вывода.
        </p>
      </div>
    `;

    const allFiles = getAllFiles(files);

    // Определяем какой HTML рендерить: если активен HTML файл - его, иначе ищем любой .html (например, index.html)
    let htmlContent = defaultPlaceholder;
    if (activeFile && activeFile.name.endsWith('.html')) {
      htmlContent = activeFile.content || defaultPlaceholder;
    } else {
      const htmlNode = allFiles.find(f => f.name.endsWith('.html'));
      if (htmlNode?.content) {
        htmlContent = htmlNode.content;
      }
    }

    // Ищем стили CSS
    const cssNodes = allFiles.filter(f => f.name.endsWith('.css'));
    const combinedCSS = cssNodes.map(f => f.content || '').join('\n');

    // Ищем JS / TS скрипты
    const jsNodes = allFiles.filter(f => f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.tsx'));
    const combinedJS = jsNodes.map(f => f.content || '').join('\n');

    // Скрипт перехвата сообщений консоли и кликов по ссылкам
    const consoleAndNavInterceptor = `
      <script>
        (function() {
          const _log = console.log;
          const _warn = console.warn;
          const _error = console.error;

          console.log = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', message: args.join(' ') }, '*');
            _log.apply(console, args);
          };
          console.warn = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', message: args.join(' ') }, '*');
            _warn.apply(console, args);
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', message: args.join(' ') }, '*');
            _error.apply(console, args);
          };

          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href')) {
              const href = link.getAttribute('href');
              if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                e.preventDefault();
                window.parent.postMessage({ type: 'NAVIGATE_TO_FILE', href: href }, '*');
              }
            }
          });
        })();
      </script>
    `;

    const originUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.startsWith('file:') 
      ? window.location.origin 
      : 'http://localhost:5173';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <base href="${originUrl}/">
          ${consoleAndNavInterceptor}
          <style>${combinedCSS}</style>
        </head>
        <body>
          ${htmlContent}
          <script>${combinedJS}</script>
        </body>
      </html>
    `;
  }, [files, activeFile]);

  const updateIframe = useCallback(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(generatePreviewHTML());
        doc.close();
      }
    }
  }, [generatePreviewHTML]);

  useEffect(() => {
    updateIframe();

    // Слушатель сообщений от iframe
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'CONSOLE_LOG') {
        onLogMessage(event.data.level, event.data.message);
      } else if (event.data.type === 'NAVIGATE_TO_FILE') {
        const targetHref = event.data.href.replace(/^[\/\\]+/, '').toLowerCase();
        const allFiles = getAllFiles(files);
        const found = allFiles.find(f => f.name.toLowerCase() === targetHref || f.path.toLowerCase().endsWith(targetHref));
        if (found && onSelectFile) {
          onSelectFile(found);
        } else {
          onLogMessage('warn', 'Переход: файл "' + event.data.href + '" не найден в проекте.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [updateIframe, onLogMessage, onSelectFile, files]);


  return (
    <div className="preview-pane" style={{ width: width ? `${width}px` : undefined, flex: width ? `0 0 ${width}px` : 1, overflow: 'hidden' }}>
      {/* Верхняя шапка предпросмотра */}
      <div className="preview-header">
        <span style={{ fontWeight: 600 }}>🌐 Live Preview (Интерактивный предпросмотр)</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="icon-btn"
            onClick={updateIframe}
            title="Обновить предпросмотр"
          >
            <RefreshCw size={14} />
          </button>
          {onClose && (
            <button 
              className="icon-btn"
              onClick={onClose}
              title="Свернуть Live Preview"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Безопасная песочница iframe */}
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        title="Live Preview Sandbox"
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
      />
    </div>
  );
};
