const { app, BrowserWindow, ipcMain, dialog, Menu, session } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;

// Путь к системному файлу настроек NovaCode IDE
const getSettingsFilePath = () => path.join(app.getPath('userData'), 'novacode-settings.json');

// Быстрое асинхронное чтение структуры папки в дереве с фильтрацией тяжёлых директорий
function scanDirectory(dirPath, rootPath = dirPath) {
  const stats = fs.statSync(dirPath);
  const name = path.basename(dirPath);
  const relPath = path.relative(rootPath, dirPath) || name;

  if (stats.isDirectory()) {
    if (name === 'node_modules' || name === '.git' || name === 'dist' || name === 'build' || name === 'release' || name === 'build-release') {
      return null;
    }

    const childrenRaw = fs.readdirSync(dirPath);
    const children = [];

    for (const childName of childrenRaw) {
      const childFullPath = path.join(dirPath, childName);
      try {
        const childNode = scanDirectory(childFullPath, rootPath);
        if (childNode) {
          children.push(childNode);
        }
      } catch (err) {
        // Игнорируем защищённые файлы
      }
    }

    children.sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });

    return {
      id: relPath.replace(/\\/g, '/'),
      name,
      path: relPath.replace(/\\/g, '/'),
      isFolder: true,
      isOpen: false,
      children
    };
  } else {
    const ext = name.split('.').pop() || 'txt';
    let content = '';
    if (stats.size < 2000000) {
      try {
        content = fs.readFileSync(dirPath, 'utf-8');
      } catch (e) {
        content = '// Ошибка чтения файла';
      }
    } else {
      content = '// Крупный бинарный файл не загружен полностью';
    }

    return {
      id: relPath.replace(/\\/g, '/'),
      name,
      path: relPath.replace(/\\/g, '/'),
      isFolder: false,
      language: ext,
      content
    };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: 'NovaCode IDE',
    icon: path.join(__dirname, '../public/icon.ico'),
    backgroundColor: '#090d16',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  mainWindow.setMenuBarVisibility(false); // Hide the menu bar

  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true);
  });
  session.defaultSession.setPermissionCheckHandler(() => {
    return true;
  });

  const isDev = !app.isPackaged;
  const distFolder = path.join(__dirname, '../dist');

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (fs.existsSync(path.join(distFolder, 'index.html'))) {
    const http = require('http');
    const startLocalServer = (folder, defaultPort = 5173) => {
      return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
          let reqUrl = req.url.split('?')[0];
          if (reqUrl === '/') reqUrl = '/index.html';
          const filePath = path.join(folder, reqUrl);

          fs.readFile(filePath, (err, data) => {
            if (err) {
              fs.readFile(path.join(folder, 'index.html'), (err2, data2) => {
                if (err2) { res.writeHead(404); res.end('Not found'); }
                else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(data2); }
              });
            } else {
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes = {
                '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
                '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
                '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2'
              };
              res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
              res.end(data);
            }
          });
        });
        server.on('error', () => {
          server.listen(0, '127.0.0.1', () => resolve(`http://localhost:${server.address().port}`));
        });
        server.listen(defaultPort, '127.0.0.1', () => resolve(`http://localhost:${defaultPort}`));
      });
    };

    startLocalServer(distFolder, 5173).then((localUrl) => {
      if (mainWindow) mainWindow.loadURL(localUrl);
    });
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 1. IPC открыть папку
ipcMain.handle('dialog:openFolder', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const folderPath = result.filePaths[0];
  const tree = scanDirectory(folderPath);
  return { 
    folderName: path.basename(folderPath),
    folderPath, 
    tree: tree?.children || [] 
  };
});

// 2. IPC Выполнение команд оболочки (PowerShell / Git / Bash)
ipcMain.handle('terminal:executeCommand', async (event, { command, cwd }) => {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    const shell = isWin ? 'powershell.exe' : '/bin/bash';

    exec(command, { cwd: cwd || process.cwd(), shell, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      const output = (stdout || '') + (stderr || '');
      resolve({
        success: !error,
        output: output.trim() ? output : (error ? `Ошибка: ${error.message}` : 'Выполнено (нет вывода)')
      });
    });
  });
});

// 3. IPC Настоящая запись файла на диск
ipcMain.handle('file:write', async (event, { folderPath, relativePath, content }) => {
  try {
    if (!folderPath) return { success: false, error: 'Папка не открыта' };
    const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(folderPath, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content || '', 'utf-8');
    return { success: true, fullPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 4. IPC Настоящее удаление файла с диска
ipcMain.handle('file:delete', async (event, { folderPath, relativePath }) => {
  try {
    if (!folderPath) return { success: false };
    const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(folderPath, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ---------- Antigravity CLI Integration ----------
const { spawn } = require('child_process');
let cliProcess = null;

// Start PowerShell with agy in the project folder (visible for login)
ipcMain.handle('cli:start', async (event, { folderPath }) => {
  if (cliProcess) {
    return { alreadyRunning: true };
  }
  try {
    const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass'], {
      cwd: folderPath,
      windowsHide: false, // show window for login
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    cliProcess = ps;
    ps.stdout.on('data', data => {
      event.sender.send('cli:output', data.toString());
    });
    ps.stderr.on('data', data => {
      event.sender.send('cli:output', data.toString());
    });
    ps.on('exit', code => {
      cliProcess = null;
      event.sender.send('cli:exit', code);
    });
    return { started: true };
  } catch (e) {
    console.error('Failed to start CLI:', e);
    return { error: e.message };
  }
});

// Send a command to the running CLI process
ipcMain.handle('cli:send', async (_, { command }) => {
  if (!cliProcess) throw new Error('CLI not running');
  cliProcess.stdin.write(command + '\n');
  return { sent: true };
});

// Hide the CLI window after login by respawning hidden PowerShell
ipcMain.handle('cli:hide', async (event, { folderPath }) => {
  if (cliProcess) {
    cliProcess.kill();
    cliProcess = null;
  }
  const hidden = spawn('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass'], {
    cwd: folderPath,
    windowsHide: true,
    detached: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  cliProcess = hidden;
  hidden.stdout.on('data', data => {
    event.sender.send('cli:output', data.toString());
  });
  hidden.stderr.on('data', data => {
    event.sender.send('cli:output', data.toString());
  });
  hidden.on('exit', code => {
    cliProcess = null;
    event.sender.send('cli:exit', code);
  });
  return { hidden: true };
});

// Ensure CLI process is terminated when app quits
app.on('will-quit', () => {
  if (cliProcess) {
    cliProcess.kill();
  }
});

// Интеграция в контекстное меню проводника Windows (Open with NovaCode IDE)
ipcMain.handle('windows:integrate', async () => {
  if (process.platform !== 'win32') {
    return { success: false, error: 'Интеграция поддерживается только на ОС Windows' };
  }
  return new Promise((resolve) => {
    try {
      const exePath = app.getPath('exe');
      const command = `
        $path = "${exePath.replace(/\\/g, '\\\\')}";
        New-Item -Path "HKCU:\\Software\\Classes\\Directory\\Background\\shell\\NovaCodeIDE" -Force | Out-Null;
        Set-ItemProperty -Path "HKCU:\\Software\\Classes\\Directory\\Background\\shell\\NovaCodeIDE" -Name "(Default)" -Value "Открывать в NovaCode IDE" -Force;
        Set-ItemProperty -Path "HKCU:\\Software\\Classes\\Directory\\Background\\shell\\NovaCodeIDE" -Name "Icon" -Value "$path" -Force;
        New-Item -Path "HKCU:\\Software\\Classes\\Directory\\Background\\shell\\NovaCodeIDE\\command" -Force | Out-Null;
        Set-ItemProperty -Path "HKCU:\\Software\\Classes\\Directory\\Background\\shell\\NovaCodeIDE\\command" -Name "(Default)" -Value "\\"$path\\" \\"%V\\"" -Force;
      `;
      const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command], {
        windowsHide: true
      });
      ps.on('exit', (code) => {
        if (code === 0) resolve({ success: true });
        else resolve({ success: false, error: `Код ошибки PowerShell: ${code}` });
      });
      ps.on('error', (err) => resolve({ success: false, error: err.message }));
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
});

// ------------------------------------------------

function getSettingsFilePath() {
  return path.join(app.getPath('userData'), 'novacode-settings.json');
}

// 5. IPC Сохранение и Загрузка настроек в novacode-settings.json
ipcMain.handle('settings:saveToFile', async (event, settings) => {
  try {
    const filePath = getSettingsFilePath();
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('settings:loadFromFile', async () => {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading settings file:', err);
  }
  return null;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
