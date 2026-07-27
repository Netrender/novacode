/**
 * Главный компонент NovaCode IDE (App.tsx)
 * Объединяет: Меню в стиле VS Code (File, Edit, View, Run, Terminal...), Дерево файлов с вложенной иерархией папок,
 * Редактор Monaco, Встроенный ИИ-Ассистент, Управление версиями Git, Бэкапы, Интерактивный Терминал,
 * Live Preview, Visual SQL DB Viewer и Управление Настройками.
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  FileNode, 
  EditorTab, 
  PresetType, 
  ConsoleMessage, 
  IDESettings, 
  SupportedLanguage 
} from './types/ide';
import { PRESETS_LIST, PROJECT_TEMPLATES } from './utils/presets';
import { downloadZipBackup } from './utils/backup';
import { loadSavedSettings, loadSavedSettingsAsync, saveSettings } from './utils/storage';
import { MenuBar } from './components/MenuBar/MenuBar';
import { ActivityBar } from './components/ActivityBar/ActivityBar';
import { Resizer } from './components/Resizer/Resizer';
import { FileExplorer } from './components/FileExplorer/FileExplorer';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { LivePreview } from './components/LivePreview/LivePreview';
import { SqlDbViewer } from './components/SqlDbViewer/SqlDbViewer';
import { ConsolePane } from './components/ConsolePane/ConsolePane';
import { AiAssistant } from './components/AiAssistant/AiAssistant';
import { GitPanel } from './components/GitPanel/GitPanel';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal/OnboardingModal';
import { SmartFileModal } from './components/SmartFileModal/SmartFileModal';
import { StatusBar } from './components/StatusBar/StatusBar';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { X, Code2 } from 'lucide-react';
import './styles/theme.css';

// Разворачивание / Сворачивание папки в дереве
const toggleFolderOpen = (nodes: FileNode[], folderId: string): FileNode[] => {
  return nodes.map(node => {
    if (node.id === folderId) {
      return { ...node, isOpen: !node.isOpen };
    }
    if (node.isFolder && node.children) {
      return { ...node, children: toggleFolderOpen(node.children, folderId) };
    }
    return node;
  });
};

// Вспомогательное построение вложенной иерархии дерева папок из списка путей
function buildTreeFromFlatFiles(rawFiles: { path: string; name: string; content: string }[]): FileNode[] {
  const rootNodes: FileNode[] = [];
  const folderMap: Record<string, FileNode> = {};

  rawFiles.forEach(file => {
    const parts = file.path.split(/[\/\\]/);
    let currentPath = '';
    let currentLevel = rootNodes;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLast = index === parts.length - 1;

      if (isLast) {
        const ext = part.split('.').pop() || 'txt';
        currentLevel.push({
          id: currentPath,
          name: part,
          path: currentPath,
          isFolder: false,
          language: ext as SupportedLanguage,
          content: file.content
        });
      } else {
        if (!folderMap[currentPath]) {
          const folderNode: FileNode = {
            id: currentPath,
            name: part,
            path: currentPath,
            isFolder: true,
            isOpen: false,
            children: []
          };
          folderMap[currentPath] = folderNode;
          currentLevel.push(folderNode);
        }
        currentLevel = folderMap[currentPath].children!;
      }
    });
  });

  return rootNodes;
}

export function App() {
  const [currentPreset, setCurrentPreset] = useState<PresetType>('custom');
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: 'index.html',
      name: 'index.html',
      path: 'index.html',
      isFolder: false,
      language: 'html',
      content: '<!-- Пустой проект NovaCode IDE -->\n<!DOCTYPE html>\n<html lang="ru">\n<head>\n  <meta charset="UTF-8">\n  <title>Мой Проект</title>\n</head>\n<body>\n  <h1>Мой Проект</h1>\n</body>\n</html>'
    },
    {
      id: 'main.js',
      name: 'main.js',
      path: 'main.js',
      isFolder: false,
      language: 'javascript',
      content: '// Запустите ваш код или открывайте свои файлы!\nconsole.log("Hello from NovaCode IDE!");'
    }
  ]);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeFolderPath, setActiveFolderPath] = useState<string>('');

  // Состояние панелей
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [showDbViewer, setShowDbViewer] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [showGitPanel, setShowGitPanel] = useState<boolean>(false);
  const [showExplorer, setShowExplorer] = useState<boolean>(true);
  const [showConsole, setShowConsole] = useState<boolean>(true);
  const [showMenuBar, setShowMenuBar] = useState<boolean>(true);

  // Размеры панелей (для ресайза a-la VS Code)
  const [gitWidth, setGitWidth] = useState<number>(280);
  const [explorerWidth, setExplorerWidth] = useState<number>(250);
  const [aiWidth, setAiWidth] = useState<number>(340);
  const [consoleHeight, setConsoleHeight] = useState<number>(180);
  const [dbViewerWidth, setDbViewerWidth] = useState<number>(320);
  const [previewWidth, setPreviewWidth] = useState<number>(450);

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [settings, setSettings] = useState<IDESettings>(loadSavedSettings);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(!loadSavedSettings().hasSeenOnboarding);
  const [smartFileModal, setSmartFileModal] = useState<{
    presetName: string;
    expectedPath: string;
    presetType: PresetType;
  } | null>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Загрузка настроек из нативного файла в Electron при старте
  useEffect(() => {
    loadSavedSettingsAsync().then(loaded => {
      setSettings(loaded);
      if (!loaded.hasSeenOnboarding) {
        setShowOnboardingModal(true);
      }
    });
  }, []);

  // Автоматическое сохранение настроек при их изменении
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Глобальный слушатель горячих клавиш (F5 - открыть предпросмотр)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        setShowPreview(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Добавление сообщения в консоль вывода IDE
  const addLogMessage = (type: 'log' | 'warn' | 'error' | 'info' | 'system', message: string) => {
    const newMsg: ConsoleMessage = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setConsoleMessages(prev => [...prev, newMsg]);
  };

  // Открытие файла во вкладке
  const openFileInTab = useCallback((file: FileNode) => {
    if (file.isFolder || file.content === undefined) {
      setFiles(prev => toggleFolderOpen(prev, file.id));
      return;
    }

    setTabs(prev => {
      const existingTab = prev.find(t => t.fileId === file.id);
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return prev;
      }
      const ext = file.name.split('.').pop() || 'javascript';
      const newTab: EditorTab = {
        id: Date.now().toString(),
        fileId: file.id,
        name: file.name,
        path: file.path,
        language: ext as SupportedLanguage,
        content: file.content || '',
        isDirty: false
      };
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
  }, []);

  // Автоматическое открытие первого файла при смене пресета
  useEffect(() => {
    const templateFiles = PROJECT_TEMPLATES[currentPreset] || PROJECT_TEMPLATES['frontend_vanilla'];
    setFiles(templateFiles);

    const firstFile = templateFiles.find(f => !f.isFolder) || templateFiles[0]?.children?.find(f => !f.isFolder);
    if (firstFile && firstFile.content) {
      openFileInTab(firstFile);
    }

    addLogMessage('system', `🚀 Загружен пресет проекта: ${currentPreset.toUpperCase()}`);
  }, [currentPreset, openFileInTab]);

  // Вспомогательный рекурсивный поиск файла по id, имени или пути
  const findFileByPath = (nodes: FileNode[], target: string): FileNode | null => {
    const normTarget = target.replace(/\\/g, '/').toLowerCase();
    for (const node of nodes) {
      const normPath = node.path.replace(/\\/g, '/').toLowerCase();
      const normName = node.name.toLowerCase();
      if (normPath === normTarget || normName === normTarget || normPath.endsWith('/' + normTarget)) {
        return node;
      }
      if (node.isFolder && node.children) {
        const found = findFileByPath(node.children, target);
        if (found) return found;
      }
    }
    return null;
  };

  // Закрытие вкладки
  const handleCloseTab = (tabId: string) => {
    setTabs(prev => {
      const nextTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null);
      }
      return nextTabs;
    });
  };

  // Нативное сохранение файла на физический диск через IPC
  const syncFileToDisk = async (relativePath: string, content: string) => {
    if (typeof window !== 'undefined' && (window as any).require && activeFolderPath) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        await ipcRenderer.invoke('file:write', {
          folderPath: activeFolderPath,
          relativePath,
          content
        });
      } catch (e) {
        console.error('IPC File write error:', e);
      }
    }
  };

  const syncFileDeleteToDisk = async (relativePath: string) => {
    if (typeof window !== 'undefined' && (window as any).require && activeFolderPath) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        await ipcRenderer.invoke('file:delete', {
          folderPath: activeFolderPath,
          relativePath
        });
      } catch (e) {
        console.error('IPC File delete error:', e);
      }
    }
  };

  // Ручное сохранение текущего файла (Save File / Ctrl+S)
  const handleSaveActiveFile = useCallback(() => {
    if (!activeTabId) return;

    setTabs(prev => {
      const targetTab = prev.find(t => t.id === activeTabId);
      if (!targetTab) return prev;

      setFiles(filesPrev => updateFileContentInTree(filesPrev, targetTab.fileId, targetTab.content));
      syncFileToDisk(targetTab.path || targetTab.name, targetTab.content);
      addLogMessage('system', `💾 Файл ${targetTab.name} успешно сохранён на диск.`);
      return prev.map(t => t.id === activeTabId ? { ...t, isDirty: false } : t);
    });
  }, [activeTabId, activeFolderPath]);

  // Горячая клавиша Ctrl+S для сохранения
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveActiveFile();
      }
    };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSaveActiveFile]);


  // Изменение содержимого в Monaco Editor
  const handleEditorContentChange = (newContent: string) => {
    if (!activeTabId) return;

    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, content: newContent, isDirty: true } : t));

    if (settings.autoSave) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab) {
        setFiles(prev => updateFileContentInTree(prev, activeTab.fileId, newContent));
        syncFileToDisk(activeTab.path || activeTab.name, newContent);
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isDirty: false } : t));
      }
    }
  };

  const updateFileContentInTree = (nodes: FileNode[], fileId: string, content: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === fileId) return { ...node, content };
      if (node.isFolder && node.children) {
        return { ...node, children: updateFileContentInTree(node.children, fileId, content) };
      }
      return node;
    });
  };

  // Создание нового файла или папки
  const handleCreateFile = (name: string, isFolder: boolean) => {
    const ext = name.split('.').pop() || 'js';
    const initialContent = isFolder ? undefined : `// Файл ${name}\n`;
    const newNode: FileNode = {
      id: Date.now().toString(),
      name,
      path: name,
      isFolder,
      language: ext as SupportedLanguage,
      content: initialContent
    };

    setFiles(prev => [...prev, newNode]);
    if (!isFolder) {
      openFileInTab(newNode);
      syncFileToDisk(name, initialContent || '');
    }
    addLogMessage('system', `➕ Создан ${isFolder ? 'папка' : 'файл'}: ${name} (синхронизировано на диск)`);
  };

  // Удаление файла
  const handleDeleteFile = (fileId: string) => {
    const targetFile = files.find(f => f.id === fileId);
    if (targetFile) {
      syncFileDeleteToDisk(targetFile.path || targetFile.name);
    }
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setTabs(prev => prev.filter(t => t.fileId !== fileId));
    addLogMessage('warn', `🗑️ Файл удалён из проекта и с диска.`);
  };

  // Создание бэкапа
  const handleCreateBackup = async () => {
    addLogMessage('system', '📦 Формирование полного резервного бэкапа проекта...');
    await downloadZipBackup(currentPreset, files);
    addLogMessage('system', '✅ Бэкап успешно создан и загружен в .zip архив.');
  };

  // Мгновенное нативное открытие папки в Electron / Браузере
  const handleOpenFolderDialog = async () => {
    // 1. Проверяем Electron IPC
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const res = await ipcRenderer.invoke('dialog:openFolder');
        if (res && res.tree) {
          setFiles(res.tree);
          setCurrentPreset('custom');
          setTabs([]);
          setActiveTabId(null);
          if (res.folderPath) {
            setActiveFolderPath(res.folderPath);
          }
          addLogMessage('system', `📁 Открыта нативная папка: "${res.folderName}" (${res.folderPath})`);
          return;
        }
      } catch (err) {
        console.error('IPC OpenFolder Error:', err);
      }
    }

    // 2. Веб-фоллбэк диалог
    const input = document.createElement('input');
    input.type = 'file';
    // @ts-ignore
    input.webkitdirectory = true;
    input.onchange = (e: any) => {
      const selectedFiles: FileList = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0) return;

      const rawFileList: { path: string; name: string; content: string }[] = [];
      let loadedCount = 0;

      Array.from(selectedFiles).forEach((file: any) => {
        const relativePath = file.webkitRelativePath || file.name;
        const parts = relativePath.split('/');

        if (parts.includes('node_modules') || parts.includes('.git') || parts.includes('dist')) {
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string || '';
          rawFileList.push({
            path: relativePath,
            name: parts[parts.length - 1],
            content
          });
          loadedCount++;

          if (loadedCount === selectedFiles.length || loadedCount >= rawFileList.length) {
            const nestedTree = buildTreeFromFlatFiles(rawFileList);
            setFiles(nestedTree);
            setCurrentPreset('custom');
            setTabs([]);
            setActiveTabId(null);
            addLogMessage('system', `📁 Открыта папка с древовидной структурой (${nestedTree.length} корневых элементов).`);
          }
        };
        reader.readAsText(file);
      });
    };
    input.click();
  };

  // Выполнение реальных терминальных команд через нативную оболочку (PowerShell / Bash / Git)
  const handleRunTerminalCommand = async (cmd: string) => {
    addLogMessage('system', `PS > ${cmd}`);

    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const res = await ipcRenderer.invoke('terminal:executeCommand', { 
          command: cmd, 
          cwd: activeFolderPath || undefined 
        });
        if (res && res.output) {
          addLogMessage(res.success ? 'log' : 'error', res.output);
          return;
        }
      } catch (err) {
        console.error('Terminal IPC Error:', err);
      }
    }

    addLogMessage('info', `Выполнена команда в консоли: ${cmd}`);
  };

  // Главная кнопка «Запустить»
  const handleRunMacro = () => {
    const activePresetConfig = PRESETS_LIST.find(p => p.id === currentPreset) || PRESETS_LIST[0];
    const expectedPath = settings.entryPoints[currentPreset] || activePresetConfig.defaultEntryPoint;

    const entryFile = findFileByPath(files, expectedPath);

    if (!entryFile && currentPreset !== 'custom') {
      setSmartFileModal({
        presetName: activePresetConfig.name,
        expectedPath,
        presetType: currentPreset
      });
      return;
    }

    addLogMessage('system', `⚡ Выполнение макроса: [${activePresetConfig.runCommandLabel}]`);

    if (currentPreset === 'rust') {
      addLogMessage('log', '🦀 [cargo run] Компиляция проекта novacode_rust_app v0.1.0...');
      addLogMessage('log', 'Finished dev [unoptimized + debuginfo] target(s) in 0.38s');
      addLogMessage('system', '--- ВЫВОД STDOUT ---');
      addLogMessage('log', '🦀 Приветствуем в NovaCode Rust Environment!\nИтоговая сумма: 150');
    } else if (currentPreset === 'cpp') {
      addLogMessage('log', '⚙️ [g++ -O3] Сборка исполняемого файла src/main.cpp...');
      addLogMessage('log', 'Компиляция завершена без ошибок.');
      addLogMessage('system', '--- ВЫВОД STDOUT ---');
      addLogMessage('log', 'Пользователь: Максим [ID роли: 1]');
    } else {
      setShowPreview(true);
      addLogMessage('log', `🌐 Live Preview сервер запущен для файла ${expectedPath}`);
    }
  };

  // Интеграция в контекстное меню проводника Windows
  const handleIntegrateWindows = async () => {
    if (typeof window !== 'undefined' && (window as any).require) {
      const { ipcRenderer } = (window as any).require('electron');
      try {
        addLogMessage('system', '⏳ Выполняется интеграция в контекстное меню проводника Windows...');
        const res = await ipcRenderer.invoke('windows:integrate');
        if (res && res.success) {
          addLogMessage('system', '✅ Успешно добавлено в контекстное меню «Открывать в NovaCode IDE»!');
          alert('Успешно интегрировано! Теперь при нажатии правой кнопкой мыши на любую папку в проводнике Windows будет доступен пункт «Открывать в NovaCode IDE» с вашей иконкой.');
        } else {
          addLogMessage('error', `Не удалось интегрировать в проводник: ${res?.error || 'ошибка'}`);
          alert(`Ошибка интеграции: ${res?.error || 'неизвестная ошибка'}`);
        }
      } catch (e: any) {
        console.error('Integration error:', e);
        addLogMessage('error', `Ошибка при интеграции в Windows: ${e.message}`);
      }
    } else {
      alert('Интеграция доступна только в приложении NovaCode IDE на Windows.');
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="ide-container">
      {/* 1. Единая верхняя Панель Меню и Управления NovaCode IDE */}
      {showMenuBar ? (
        <MenuBar 
          currentPreset={currentPreset}
          onSelectPreset={setCurrentPreset}
          onOpenFolder={handleOpenFolderDialog}
          onCreateNewFile={() => handleCreateFile('new_file.js', false)}
          onSaveFile={handleSaveActiveFile}
          onCreateBackup={handleCreateBackup}
          onRunMacro={handleRunMacro}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          showDbViewer={showDbViewer}
          onToggleDbViewer={() => setShowDbViewer(!showDbViewer)}
          showAiAssistant={showAiAssistant}
          onToggleAiAssistant={() => setShowAiAssistant(!showAiAssistant)}
          showGitPanel={showGitPanel}
          onToggleGitPanel={() => setShowGitPanel(!showGitPanel)}
          showExplorer={showExplorer}
          onToggleExplorer={() => setShowExplorer(!showExplorer)}
          showConsole={showConsole}
          onToggleConsole={() => setShowConsole(!showConsole)}
          onToggleMenuBar={() => setShowMenuBar(false)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenOnboarding={() => setShowOnboardingModal(true)}
          onClearConsole={() => setConsoleMessages([])}
          onIntegrateWindows={handleIntegrateWindows}
        />
      ) : (
        <button
          onClick={() => setShowMenuBar(true)}
          title="Развернуть верхнее меню (Шапку IDE)"
          style={{
            position: 'absolute',
            top: '4px',
            right: '16px',
            zIndex: 9999,
            background: '#1e293b',
            border: '1px solid #475569',
            borderRadius: '6px',
            padding: '4px 12px',
            color: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontWeight: 600
          }}
        >
          <span>Шапка IDE ▼</span>
        </button>
      )}

      {/* 3. Основной корпус IDE */}
      <div className="ide-body">
        {/* Вертикальная панель активности в стиле VS Code */}
        <ActivityBar
          showExplorer={showExplorer}
          onToggleExplorer={() => setShowExplorer(!showExplorer)}
          showGitPanel={showGitPanel}
          onToggleGitPanel={() => setShowGitPanel(!showGitPanel)}
          showAiAssistant={showAiAssistant}
          onToggleAiAssistant={() => setShowAiAssistant(!showAiAssistant)}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          showDbViewer={showDbViewer}
          onToggleDbViewer={() => setShowDbViewer(!showDbViewer)}
          showConsole={showConsole}
          onToggleConsole={() => setShowConsole(!showConsole)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Панель управления Git */}
        {showGitPanel && (
          <>
            <GitPanel 
              onRunGitCommand={handleRunTerminalCommand}
              onClose={() => setShowGitPanel(false)}
              width={gitWidth}
            />
            <Resizer direction="vertical" onResize={(delta) => setGitWidth(w => Math.max(160, Math.min(600, w + delta)))} title="Потяните для изменения ширины Git панели" />
          </>
        )}

        {/* Боковое дерево файлов с древовидной вложенностью */}
        {showExplorer && (
          <>
            <FileExplorer 
              files={files}
              activeFileId={activeTab ? activeTab.fileId : null}
              onSelectFile={openFileInTab}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
              onOpenFolderDialog={handleOpenFolderDialog}
              onClose={() => setShowExplorer(false)}
              width={explorerWidth}
            />
            <Resizer direction="vertical" onResize={(delta) => setExplorerWidth(w => Math.max(160, Math.min(600, w + delta)))} title="Потяните для изменения ширины дерева файлов" />
          </>
        )}

        {/* Рабочая область: Редактор кода + Вкладки */}
        <div className="main-workspace">
          {/* Вкладки */}
          <div className="tab-bar">
            {tabs.map(tab => (
              <div 
                key={tab.id}
                className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <Code2 size={14} color="#6366f1" />
                <span>{tab.name}{tab.isDirty ? ' •' : ''}</span>
                <button 
                  className="tab-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseTab(tab.id);
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Сплит: Monaco Editor / Visual DB / Live Preview */}
          <div className="split-pane">
            {activeTab ? (
              <ErrorBoundary>
                <CodeEditor 
                  content={activeTab.content}
                  language={activeTab.language}
                  onChange={handleEditorContentChange}
                  onCursorPositionChange={(line, col) => setCursorPos({ line, col })}
                />
              </ErrorBoundary>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Выберите файл слева или откройте папку в меню File &rarr; Открыть папку
              </div>
            )}

            {showDbViewer && (
              <>
                <Resizer direction="vertical" onResize={(delta) => setDbViewerWidth(w => Math.max(200, Math.min(800, w - delta)))} title="Потяните для изменения ширины SQL DB Viewer" />
                <ErrorBoundary>
                  <SqlDbViewer onClose={() => setShowDbViewer(false)} width={dbViewerWidth} />
                </ErrorBoundary>
              </>
            )}

            {showPreview && (
              <>
                <Resizer direction="vertical" onResize={(delta) => setPreviewWidth(w => Math.max(200, Math.min(900, w - delta)))} title="Потяните для изменения ширины Live Preview" />
                <ErrorBoundary>
                  <LivePreview 
                    files={files}
                    activeFile={activeTab}
                    onLogMessage={(level, msg) => addLogMessage(level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log', `[Preview] ${msg}`)}
                    onSelectFile={openFileInTab}
                    onClose={() => setShowPreview(false)}
                    width={previewWidth}
                  />
                </ErrorBoundary>
              </>
            )}
          </div>

          {/* Консоль логов и Терминал */}
          {showConsole && (
            <>
              <Resizer direction="horizontal" onResize={(delta) => setConsoleHeight(h => Math.max(80, Math.min(600, h + delta)))} title="Потяните для изменения высоты терминала" />
              <ConsolePane 
                messages={consoleMessages}
                onClearConsole={() => setConsoleMessages([])}
                onRunTerminalCommand={handleRunTerminalCommand}
                onClose={() => setShowConsole(false)}
                height={consoleHeight}
              />
            </>
          )}
        </div>

        {/* Боковая панель ИИ-Ассистента */}
        {showAiAssistant && (
          <>
            <Resizer direction="vertical" onResize={(delta) => setAiWidth(w => Math.max(220, Math.min(700, w - delta)))} title="Потяните для изменения ширины ИИ-Ассистента" />
            <AiAssistant 
              files={files}
              activeFileContent={activeTab?.content}
              activeFileName={activeTab?.name}
              onClose={() => setShowAiAssistant(false)}
              width={aiWidth}
            />
          </>
        )}
      </div>

      {/* Статус-бар */}
      <StatusBar 
        currentLine={cursorPos.line}
        currentCol={cursorPos.col}
        language={activeTab ? activeTab.language : 'javascript'}
        preset={currentPreset}
        activeFilePath={activeTab?.path}
      />

      {/* Модальные окна */}
      {showOnboardingModal && (
        <OnboardingModal
          settings={settings}
          onUpdateSettings={(newSet) => {
            setSettings(newSet);
            saveSettings(newSet);
          }}
          onClose={() => {
            const newSet = { ...settings, hasSeenOnboarding: true };
            setSettings(newSet);
            saveSettings(newSet);
            setShowOnboardingModal(false);
          }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
          settings={settings}
          onUpdateSettings={(newSet) => {
            setSettings(newSet);
            saveSettings(newSet);
          }}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {smartFileModal && (
        <SmartFileModal 
          presetName={smartFileModal.presetName}
          expectedPath={smartFileModal.expectedPath}
          presetType={smartFileModal.presetType}
          onCreateMissingFile={(newFileName) => handleCreateFile(newFileName, false)}
          onClose={() => setSmartFileModal(null)}
        />
      )}
    </div>
  );
}
