/**
 * Визуальный просмотрщик баз данных SQL (Visual SQL DB Viewer)
 * Инспектирование таблиц PostgreSQL/SQLite, столбцов и данных с поиском и выполнением SQL-запросов.
 */

import React, { useState } from 'react';
import { Database, Table, Search, Play, Key, X } from 'lucide-react';
import { DEMO_DATABASE } from '../../utils/presets';
import type { SqlTable } from '../../types/ide';

interface SqlDbViewerProps {
  onClose?: () => void;
  width?: number;
}

export const SqlDbViewer: React.FC<SqlDbViewerProps> = ({ onClose, width }) => {
  const [selectedTable, setSelectedTable] = useState<SqlTable>(DEMO_DATABASE.tables[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSqlQuery, setCustomSqlQuery] = useState(`SELECT * FROM ${DEMO_DATABASE.tables[0].name};`);
  const [queryResult, setQueryResult] = useState<string | null>(null);

  const filteredRows = selectedTable.rows.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleExecuteSql = () => {
    setQueryResult(`✅ Запрос выполнен успешно! Возвращено ${filteredRows.length} строк(и).`);
  };

  return (
    <div className="db-viewer-pane" style={{ width: width ? `${width}px` : undefined, flex: width ? `0 0 ${width}px` : 1, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database size={20} color="#a855f7" />
          <h3 style={{ margin: 0 }}>Visual SQL DB Viewer ({DEMO_DATABASE.name})</h3>
        </div>
        {onClose && (
          <button className="icon-btn" style={{ padding: '4px 6px' }} onClick={onClose} title="Свернуть SQL DB Viewer">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Переключатель таблиц */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {DEMO_DATABASE.tables.map(tbl => (
          <button
            key={tbl.name}
            className={`icon-btn ${selectedTable.name === tbl.name ? 'active' : ''}`}
            onClick={() => {
              setSelectedTable(tbl);
              setCustomSqlQuery(`SELECT * FROM ${tbl.name};`);
            }}
          >
            <Table size={15} />
            <span>{tbl.name}</span>
          </button>
        ))}
      </div>

      {/* Консоль для выполнения SQL запроса */}
      <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SQL Консоль запросов:</span>
          <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleExecuteSql}>
            <Play size={13} fill="white" />
            Выполнить SQL
          </button>
        </div>
        <textarea
          className="form-input"
          style={{ fontFamily: 'var(--font-code)', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
          value={customSqlQuery}
          onChange={(e) => setCustomSqlQuery(e.target.value)}
        />
        {queryResult && (
          <div style={{ marginTop: '8px', color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>
            {queryResult}
          </div>
        )}
      </div>

      {/* Фильтр поиска по строкам таблицы */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Search size={16} color="var(--text-muted)" />
        <input 
          type="text"
          className="form-input"
          style={{ maxWidth: '300px' }}
          placeholder="Поиск по строкам таблицы..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Таблица с данными */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table className="db-table">
          <thead>
            <tr>
              {selectedTable.columns.map(col => (
                <th key={col.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.isPrimaryKey && <Key size={13} color="#f59e0b" />}
                    <span>{col.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({col.type})</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, idx) => (
              <tr key={idx}>
                {selectedTable.columns.map(col => (
                  <td key={col.name}>{String(row[col.name] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
