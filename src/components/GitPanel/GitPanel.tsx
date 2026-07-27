/**
 * Панель управления версиями Git (GitPanel.tsx)
 * Просмотр измененных файлов, совершение коммитов (Commit) и отправка в удаленный репозиторий (Push/Pull).
 */

import React, { useState } from 'react';
import { GitBranch, GitCommit, UploadCloud, DownloadCloud, FileEdit, X } from 'lucide-react';
import type { GitStatusItem } from '../../types/ide';

interface GitPanelProps {
  onRunGitCommand: (command: string) => void;
  onClose: () => void;
  width?: number;
}

export const GitPanel: React.FC<GitPanelProps> = ({ onRunGitCommand, onClose, width }) => {
  const [commitMsg, setCommitMsg] = useState('');
  const branchName = 'main';
  const [changedFiles] = useState<GitStatusItem[]>([
    { path: 'src/App.tsx', status: 'M' },
    { path: 'src/components/CodeEditor/CodeEditor.tsx', status: 'M' },
    { path: 'package.json', status: 'M' }
  ]);

  const handleCommit = () => {
    if (!commitMsg.trim()) return;
    onRunGitCommand(`git add . && git commit -m "${commitMsg.trim()}"`);
    setCommitMsg('');
  };

  return (
    <div style={{ width: width ? `${width}px` : '280px', background: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Шапка Git */}
      <div style={{ padding: '10px 14px', background: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#f97316' }}>
          <GitBranch size={18} />
          <span>Система Git ({branchName})</span>
        </div>
        <button className="icon-btn" onClick={onClose} title="Закрыть Git панель">
          <X size={14} />
        </button>
      </div>

      {/* Форма коммита */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input 
          type="text"
          className="form-input"
          placeholder="Сообщение коммита (feat: ...)"
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCommit(); }}
        />
        <button 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
          onClick={handleCommit}
        >
          <GitCommit size={14} /> Закоммитить (Commit)
        </button>

        {/* Системные действия Push / Pull */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem' }}
            onClick={() => onRunGitCommand('git pull')}
          >
            <DownloadCloud size={14} /> Pull
          </button>
          <button 
            className="btn-secondary" 
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.8rem' }}
            onClick={() => onRunGitCommand('git push')}
          >
            <UploadCloud size={14} /> Push
          </button>
        </div>
      </div>

      {/* Список измененных файлов */}
      <div style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
        Изменения ({changedFiles.length})
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {changedFiles.map((file, idx) => (
          <div 
            key={idx} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <FileEdit size={14} color="#facc15" />
              <span>{file.path}</span>
            </div>
            <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '0.8rem' }}>{file.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
