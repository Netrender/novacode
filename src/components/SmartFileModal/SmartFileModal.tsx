/**
 * Интерактивный диалог поиска главного файла (Smart File Finder Modal)
 * Вызывается, если файл запуска пресета не найден в структуре проекта.
 */

import React, { useState } from 'react';
import { AlertCircle, FilePlus, X } from 'lucide-react';
import type { PresetType } from '../../types/ide';

interface SmartFileModalProps {
  presetName: string;
  expectedPath: string;
  presetType: PresetType;
  onCreateMissingFile: (fileName: string) => void;
  onClose: () => void;
}

export const SmartFileModal: React.FC<SmartFileModalProps> = ({
  presetName,
  expectedPath,
  onCreateMissingFile,
  onClose
}) => {
  const [customFileName, setCustomFileName] = useState(expectedPath);

  const handleCreate = () => {
    if (!customFileName.trim()) return;
    onCreateMissingFile(customFileName.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
            <AlertCircle size={24} />
            <h3 className="modal-title" style={{ color: '#f8fafc' }}>Главный файл проекта не найден!</h3>
          </div>
          <button className="tab-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
          Для запуска пресета <strong>«{presetName}»</strong> требуется главный исполняемый файл: <code style={{ color: 'var(--accent-cyan)' }}>{expectedPath}</code>.
        </div>

        <div className="form-group">
          <label className="form-label">Укажите или создайте путь к главному файлу:</label>
          <input 
            type="text"
            className="form-input"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            placeholder="Например: src/main.rs"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleCreate}>
            <FilePlus size={16} />
            Создать главный файл
          </button>
        </div>
      </div>
    </div>
  );
};
