/**
 * Вертикальная панель активности в стиле VS Code (ActivityBar.tsx)
 * Расположена слева и содержит компактные иконки для переключения основных панелей.
 */

import React from 'react';
import {
  Folder,
  GitBranch,
  Bot,
  Eye,
  Database,
  Terminal,
  Settings
} from 'lucide-react';

interface ActivityBarProps {
  showExplorer: boolean;
  onToggleExplorer: () => void;
  showGitPanel: boolean;
  onToggleGitPanel: () => void;
  showAiAssistant: boolean;
  onToggleAiAssistant: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
  showDbViewer: boolean;
  onToggleDbViewer: () => void;
  showConsole: boolean;
  onToggleConsole: () => void;
  onOpenSettings: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  showExplorer,
  onToggleExplorer,
  showGitPanel,
  onToggleGitPanel,
  showAiAssistant,
  onToggleAiAssistant,
  showPreview,
  onTogglePreview,
  showDbViewer,
  onToggleDbViewer,
  showConsole,
  onToggleConsole,
  onOpenSettings
}) => {
  return (
    <div
      className="activity-bar"
      style={{
        width: '48px',
        minWidth: '48px',
        background: '#090d16',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      {/* Верхние иконки панелей */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
        <button
          className={`activity-btn ${showExplorer ? 'active' : ''}`}
          onClick={onToggleExplorer}
          title="Explorer (Файлы)"
          style={getBtnStyle(showExplorer)}
        >
          <Folder size={20} color={showExplorer ? '#e2e8f0' : '#64748b'} />
        </button>

        <button
          className={`activity-btn ${showGitPanel ? 'active' : ''}`}
          onClick={onToggleGitPanel}
          title="Git (Контроль версий)"
          style={getBtnStyle(showGitPanel)}
        >
          <GitBranch size={20} color={showGitPanel ? '#e2e8f0' : '#64748b'} />
        </button>

        <button
          className={`activity-btn ${showAiAssistant ? 'active' : ''}`}
          onClick={onToggleAiAssistant}
          title="ИИ Ассистент (Nova AI)"
          style={getBtnStyle(showAiAssistant)}
        >
          <Bot size={20} color={showAiAssistant ? '#e2e8f0' : '#64748b'} />
        </button>

        <button
          className={`activity-btn ${showPreview ? 'active' : ''}`}
          onClick={onTogglePreview}
          title="Live Preview (Предпросмотр)"
          style={getBtnStyle(showPreview)}
        >
          <Eye size={20} color={showPreview ? '#e2e8f0' : '#64748b'} />
        </button>

        <button
          className={`activity-btn ${showDbViewer ? 'active' : ''}`}
          onClick={onToggleDbViewer}
          title="SQL DB Viewer (Базы данных)"
          style={getBtnStyle(showDbViewer)}
        >
          <Database size={20} color={showDbViewer ? '#e2e8f0' : '#64748b'} />
        </button>

        <button
          className={`activity-btn ${showConsole ? 'active' : ''}`}
          onClick={onToggleConsole}
          title="Console & Terminal (Консоль)"
          style={getBtnStyle(showConsole)}
        >
          <Terminal size={20} color={showConsole ? '#e2e8f0' : '#64748b'} />
        </button>
      </div>

      {/* Нижние иконки (Настройки) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
        <button
          className="activity-btn"
          onClick={onOpenSettings}
          title="Настройки IDE (Ctrl+,)"
          style={getBtnStyle(false)}
        >
          <Settings size={20} color="#64748b" />
        </button>
      </div>
    </div>
  );
};

function getBtnStyle(isActive: boolean): React.CSSProperties {
  return {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    border: 'none',
    borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
    opacity: isActive ? 1 : 0.7
  };
}
