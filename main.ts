import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { initDir, queueReadDir, DirTree, DirTreeNode, DirTreeElement,
         cancelCurrent, writeRootToDisk, readDiskToRoot, updateLocalRoot,
         markForDelete } from './main-files';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

const ipc = require('electron').ipcMain;

const dialog = require('electron').dialog;

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false  // allow files from hard disk to show up
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

let angularApp;

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

let recursive = false;

ipc.on('just-started', function (event, someMessage) {
  angularApp = event;
  readDiskToRoot((root) => {
    if (root) {
      updateRoot(root);
    }
  });
});

ipc.on('save-root-file', function (event) {
  cancelCurrent();
  writeRootToDisk(() => {
    console.log('cached dir written!');
    angularApp.sender.send('write-done');
  });
});

ipc.on('mark-for-delete', function(event, path, file) {
  markForDelete(path, file);
});

ipc.on('update-dir', function (event, subpath) {
  cancelCurrent();
  queueReadDir(subpath, recursive, updateNode, thumbUpdate);
});

ipc.on('update-recursive', function (event, newRecursive) {
  recursive = newRecursive;
});

ipc.on('new-root', function (event) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (files) {
    if (files) {
      const rootFolder: string = files[0];
      console.log('root folder: %s', rootFolder);
      initDir(rootFolder, updateRoot);
      queueReadDir('', recursive, updateNode, thumbUpdate);
    }
  });
});

function updateRoot(root: DirTree) {
  angularApp.sender.send('root-init', root);
}

function thumbUpdate(hash: string) {
  angularApp.sender.send('thumb-update', hash);
}

function updateNode(parentPath: string, parentNode: DirTreeNode, paths: DirTreeElement[]) {
  angularApp.sender.send('node-update', parentPath, parentNode, paths);
  updateLocalRoot(parentPath, parentNode, paths);
}
