import dotenv from 'dotenv';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { registerIpcHandlers } from './ipc-handlers';

// Load environment variables from .env file (development)
// In dev: __dirname is dist/main, so go up to project root
// The .env file is in the project root
const isDev = !app.isPackaged;
if (isDev) {
  const envPath = path.join(__dirname, '..', '..', '.env');
  dotenv.config({ path: envPath });
  console.log('Loading .env from:', envPath);
} else {
  dotenv.config();
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // Native Windows title bar - looks more professional
    frame: true,
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#ffffff',
    // Better Windows integration
    autoHideMenuBar: false,
    icon: path.join(__dirname, '..', '..', 'build', 'icon.ico'),
  });

  // Register IPC handlers
  registerIpcHandlers();

  // Native Windows menu bar
  createNativeMenu();

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createNativeMenu() {
  const { Menu } = require('electron');
  
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // TODO: Open settings
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Abugida',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About Abugida',
              message: 'Abugida Font Manager',
              detail: 'Version 1.0.0\nAmharic font management for Windows',
            });
          }
        }
      ]
    }
  ];

  if (isDev) {
    template.push({
      label: 'Developer',
      submenu: [
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'reload' },
      ]
    } as any);
  }

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

