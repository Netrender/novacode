/**
 * Утилита резервного копирования (Backup System)
 * Сохраняет полную резервную копию проекта (за исключением node_modules и системных гитов).
 */

import JSZip from 'jszip';
import type { FileNode, BackupItem } from '../types/ide';

// Рекурсивное добавление файлов в zip-архив
function addFilesToZip(zip: JSZip, nodes: FileNode[]) {
  for (const node of nodes) {
    // Игнорируем тяжелые системные папки
    if (node.name === 'node_modules' || node.name === '.git' || node.name === 'dist' || node.name === 'release' || node.name === 'build-release') {
      continue;
    }

    if (node.isFolder && node.children) {
      const folderZip = zip.folder(node.name);
      if (folderZip) {
        addFilesToZip(folderZip, node.children);
      }
    } else if (node.content !== undefined) {
      zip.file(node.name, node.content);
    }
  }
}

// Создание нового бэкапа
export async function createProjectBackup(projectName: string, files: FileNode[]): Promise<BackupItem> {
  const zip = new JSZip();
  const rootFolder = zip.folder(projectName) || zip;

  addFilesToZip(rootFolder, files);

  const timestamp = new Date().toLocaleString('ru-RU');
  const backupId = 'backup_' + Date.now();

  // Рекурсивный подсчет файлов
  const countFiles = (nodes: FileNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (node.name === 'node_modules' || node.name === '.git') continue;
      if (node.isFolder && node.children) {
        count += countFiles(node.children);
      } else {
        count += 1;
      }
    }
    return count;
  };

  return {
    id: backupId,
    timestamp,
    name: `Бэкап ${projectName} (${timestamp})`,
    fileCount: countFiles(files),
    files: JSON.parse(JSON.stringify(files)) // Полная глубокая копия структуры
  };
}

// Скачивание бэкапа в формате .zip для пользователя
export async function downloadZipBackup(projectName: string, files: FileNode[]) {
  const zip = new JSZip();
  const rootFolder = zip.folder(projectName) || zip;

  addFilesToZip(rootFolder, files);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}_backup_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
