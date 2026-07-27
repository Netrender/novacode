/**
 * Компонент дерева файлов и папок проекта (File Explorer)
 * Поддерживает кастомные визуальные бэджи папок (src, public, node_modules, .git), 
 * цветовые иконки расширений файлов, открытие локальной папки и создание новых файлов.
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileText, 
  Trash2, 
  FilePlus, 
  FolderPlus,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
  Database,
  Code2,
  Atom,
  Palette,
  Braces,
  Cpu,
  Terminal,
  RefreshCw,
  X
} from 'lucide-react';
import type { FileNode } from '../../types/ide';

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onSelectFile: (file: FileNode) => void;
  onCreateFile: (name: string, isFolder: boolean, parentId?: string | null) => void;
  onDeleteFile: (id: string) => void;
  onOpenFolderDialog?: () => void;
  onClose?: () => void;
  width?: number;
}

// Отображение кастомной иконки папки в зависимости от её имени (src, public, node_modules и т.д.)
function renderFolderIcon(folderName: string, isOpen: boolean) {
  const name = folderName.toLowerCase();
  
  if (name === 'src') {
    return isOpen ? <FolderOpen size={15} color="#ea580c" /> : <Folder size={15} color="#ea580c" />;
  }
  if (name === 'public' || name === 'static') {
    return isOpen ? <FolderOpen size={15} color="#a855f7" /> : <Folder size={15} color="#a855f7" />;
  }
  if (name === 'node_modules') {
    return isOpen ? <FolderOpen size={15} color="#22c55e" /> : <Folder size={15} color="#22c55e" />;
  }
  if (name === 'dist' || name === 'build' || name === 'release') {
    return isOpen ? <FolderOpen size={15} color="#8b5cf6" /> : <Folder size={15} color="#8b5cf6" />;
  }
  if (name === 'components' || name === 'views') {
    return isOpen ? <FolderOpen size={15} color="#3b82f6" /> : <Folder size={15} color="#3b82f6" />;
  }
  if (name === 'assets' || name === 'images' || name === 'img') {
    return isOpen ? <FolderOpen size={15} color="#14b8a6" /> : <Folder size={15} color="#14b8a6" />;
  }

  return isOpen ? <FolderOpen size={15} color="#fbbf24" /> : <Folder size={15} color="#fbbf24" />;
}

// Отображение цветной иконки файла по расширению
function renderFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'js':
    case 'cjs':
    case 'mjs': return <FileCode size={14} color="#facc15" />; 
    case 'ts': return <Code2 size={14} color="#38bdf8" />; 
    case 'tsx': 
    case 'jsx': return <Atom size={14} color="#61dafb" />; 
    case 'html': return <Code2 size={14} color="#ea580c" />; 
    case 'css': return <Palette size={14} color="#38bdf8" />; 
    case 'scss':
    case 'less': return <Palette size={14} color="#ec4899" />; 
    case 'json': return <Braces size={14} color="#facc15" />;  
    case 'rs': return <Cpu size={14} color="#ea580c" />;       
    case 'cpp':
    case 'c':
    case 'h':
    case 'hpp': return <Terminal size={14} color="#3b82f6" />; 
    case 'sql':
    case 'db': return <Database size={14} color="#c084fc" />; 
    case 'vue': return <FileCode size={14} color="#10b981" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'ico': return <ImageIcon size={14} color="#14b8a6" />; 
    case 'md': return <FileText size={14} color="#94a3b8" />;
    default: return <FileText size={14} color="#cbd5e1" />;
  }
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onOpenFolderDialog,
  onClose,
  width
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleCreate = (isFolder: boolean) => {
    if (!newFileName.trim()) return;
    onCreateFile(newFileName.trim(), isFolder, null);
    setNewFileName('');
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  // Рекурсивный рендеринг дерева папок и файлов
  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        {node.isFolder ? (
          <div>
            <div 
              className={`tree-node ${activeFileId === node.id ? 'active' : ''}`}
              onClick={() => onSelectFile(node)}
              style={{ paddingLeft: `${level * 16 + 4}px` }}
            >
              <div className="tree-node-content">
                <span className="tree-chevron" style={{ display: 'flex', alignItems: 'center' }}>
                  {node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                {renderFolderIcon(node.name, !!node.isOpen)}
                <span className="tree-label">{node.name}</span>
              </div>
            </div>
            {node.isOpen && node.children && (
              <div className="tree-children">
                {renderTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ) : (
          <div 
            className={`tree-node ${activeFileId === node.id ? 'active' : ''}`}
            onClick={() => onSelectFile(node)}
            style={{ paddingLeft: `${level * 16 + 4 + 20}px` }}
          >
            <div className="tree-node-content">
              {renderFileIcon(node.name)}
              <span className="tree-label">{node.name}</span>
            </div>
            <button 
              className="tree-node-action"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(node.id);
              }}
              title="Удалить файл"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="file-explorer" style={{ width: width ? `${width}px` : undefined }}>
      {/* Заголовок с кнопками управления */}
      <div className="explorer-header">
        <span>ide</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button 
            className="icon-btn" 
            style={{ padding: '2px 4px' }}
            onClick={() => { setIsCreatingFile(true); setIsCreatingFolder(false); }}
            title="Создать новый файл"
          >
            <FilePlus size={14} />
          </button>
          <button 
            className="icon-btn" 
            style={{ padding: '2px 4px' }}
            onClick={() => { setIsCreatingFolder(true); setIsCreatingFile(false); }}
            title="Создать новую папку"
          >
            <FolderPlus size={14} />
          </button>
          <button 
            className="icon-btn" 
            style={{ padding: '2px 4px' }}
            onClick={() => {}}
            title="Обновить"
          >
            <RefreshCw size={13} />
          </button>
          {onOpenFolderDialog && (
            <button 
              className="icon-btn" 
              style={{ padding: '2px 4px' }}
              onClick={onOpenFolderDialog}
              title="Открыть локальную папку с диска"
            >
              <FolderTree size={14} />
            </button>
          )}
          {onClose && (
            <button 
              className="icon-btn" 
              style={{ padding: '2px 4px' }}
              onClick={onClose}
              title="Свернуть панель Explorer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Форма создания файла/папки */}
      {(isCreatingFile || isCreatingFolder) && (
        <div style={{ padding: '6px 12px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
          <input 
            type="text"
            className="form-input"
            style={{ padding: '4px 6px', fontSize: '13px' }}
            placeholder={isCreatingFolder ? "Имя папки..." : "Имя файла..."}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate(isCreatingFolder);
              if (e.key === 'Escape') { setIsCreatingFile(false); setIsCreatingFolder(false); }
            }}
            autoFocus
          />
        </div>
      )}

      {/* Список файлов */}
      <div className="tree-list">
        {renderTree(files)}
      </div>
    </div>
  );
};
