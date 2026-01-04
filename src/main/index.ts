import dotenv from 'dotenv';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { registerIpcHandlers } from './ipc-handlers';
import * as fontActivator from './services/font-activator';

// Load environment variables from .env file (development)
// In dev: __dirname is dist/main, so go up to project root
// The .env file is in the project root
const isDev = !app.isPackaged;
if (isDev) {
  const envPath = path.join(__dirname, '..', '..', '.env');
  dotenv.config({ path: envPath });
} else {
  // In production, try multiple locations for .env file
  // 1. Next to the executable (user can place .env there)
  // 2. In resources folder (if bundled)
  // 3. Current working directory
  const exeDir = path.dirname(process.execPath);
  const envPaths = [
    path.join(exeDir, '.env'), // Next to executable
    path.join(process.resourcesPath || __dirname, '.env'), // In resources
    path.join(process.cwd(), '.env'), // Current working directory
  ];
  
  let envLoaded = false;
  for (const envPath of envPaths) {
    const exists = fs.existsSync(envPath);
    if (exists) {
      dotenv.config({ path: envPath });
      envLoaded = true;
      break;
    }
  }
  
  if (!envLoaded) {
    // Try default dotenv.config() as last resort
    dotenv.config();
  }
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: preloadPath,
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
    const htmlPath = path.join(__dirname, '../renderer/index.html');
    mainWindow.loadFile(htmlPath).catch((err) => {
      console.error('Failed to load HTML:', err);
    });
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

app.whenReady().then(() => {
  createWindow();
});

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

// Cleanup handler: Deactivate all fonts before app quits
let isQuitting = false;
app.on('before-quit', async (event) => {
  if (!isQuitting) {
    event.preventDefault();
    isQuitting = true;
    
    // Deactivate all fonts on quit
    await fontActivator.deactivateAll();
    
    app.quit();
  }
});

