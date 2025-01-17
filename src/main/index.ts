import { app, shell, BrowserWindow, ipcMain, screen, session, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import Screenshots from 'electron-screenshots'
import Screenshots from 'electron-screenshots'
import { createConfigWindow } from './config.js'
import { Provider } from 'electron-updater'
import Store from 'electron-store'

const store = new Store()

//@ts-ignore
let enableClickThrough = store.get("enableClickThrough") ?? false

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 230,
    height: 350,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    // titleBarStyle: 'hidden',
    // titleBarStyle: 'hiddenInset',
    alwaysOnTop: true,
    frame: false,
    // resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      // TODO: 为了方便开发，暂时关闭了 webSecurity，后续需要根据实际情况开启
      webSecurity: false,
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.setAspectRatio(230 / 350)
  mainWindow.setMenu(null)

  // 窗口放在右下角，在菜单栏上
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const [windowWidth, windowHeight] = mainWindow.getSize();
  mainWindow.setPosition(width - windowWidth, height - windowHeight);

  // mainWindow.setPosition(0, 0);

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
    // mainWindow.setIgnoreMouseEvents(false, {forward: true})
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/index_l2d.html')
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index_l2d.html'))
  }

  const screenshot = new Screenshots()
  screenshot.on("ok", (e, buffer, bounds) => {
    // const picture = "data:image/png;base64," + getBase64(buffer)
    mainWindow.webContents.send('update-screen-shot-result', getBase64(buffer))
    mainWindow.show()
  })

  screenshot.on("cancel", () => {
    mainWindow.show()
  })


  ipcMain.on("setStore", (event, key, value) => {
    //@ts-ignore
    store.set(key, value)
    switch (key) {
      case "apikey":
        mainWindow.webContents.send('update-apikey', value)
        break
      case "tokenSaveMode":
        mainWindow.webContents.send('update-tokenSaveMode', value)
        break
      case "prompt":
        mainWindow.webContents.send('update-prompt', value)
        break
      case "styleName":
        mainWindow.webContents.send('update-styleName', value)
        break
      case "llmConfigs":
        mainWindow.webContents.send('update-llmConfigs', value)
        break
      case "llmModelName":
        mainWindow.webContents.send('update-llmModelName', value)
        break
      case "SoVitsConfigs":
        mainWindow.webContents.send('update-SoVitsConfigs', value)
        break
      case "enableMicrophone":
        mainWindow.webContents.send('update-enableMicrophone', value)
        break
      case "xfVoiceConfig":
        mainWindow.webContents.send('update-xfVoiceConfig', value)
        break
    }
  })

  ipcMain.on("setEnableClickThrough", (event, enable: boolean) => {
    enableClickThrough = enable
    if (enable == false) {
      mainWindow.setIgnoreMouseEvents(false, { forward: true })
    }
  })

  ipcMain.on("setIgnoreMouseEvent", (event, ignore: boolean) => {
    if (enableClickThrough) {
      mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
    }
  })

  ipcMain.on("setChara", (event, folder: string, chara: string) => {
    mainWindow.webContents.send('update-chara', folder, chara)
  })

  ipcMain.on("requestModel", (event, value: string) => {
    mainWindow.webContents.send('modelValueRequested', value)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // init screen shot module
  const screenshot = new Screenshots()

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('get-screen-shot', () => {
    return screenshot.startCapture()
  })

  ipcMain.on('open-config-window', () => {
    createConfigWindow()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


ipcMain.handle("getStore", (event, key) => {
  //@ts-ignore
  return store.get(key)
})

ipcMain.handle("deleteStore", (event, key) => {
  //@ts-ignore
  store.delete(key)
})

ipcMain.handle("open-file", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (!canceled) {
    return filePaths[0]
  }
  else {
    return ""
  }
})

ipcMain.handle("open-folder", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!canceled) {
    return filePaths[0]
  }
  else {
    return ""
  }
})

function getBase64(unit8Array) {
  let keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  var i = 0;
  while (i < unit8Array.length) {
    chr1 = unit8Array[i++];
    chr2 = unit8Array[i++];
    chr3 = unit8Array[i++];

    enc1 = chr1 >> 2;
    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}