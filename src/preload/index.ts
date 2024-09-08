import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI, IpcRenderer } from '@electron-toolkit/preload'
import { get } from 'http'

// Custom APIs for renderer
const api = {
  getScreenShot: () => ipcRenderer.invoke('get-screen-shot'),
  ping: () => ipcRenderer.send('ping'),
  openConfigWindow: () => ipcRenderer.send('open-config-window'),
  getStore: (key: string) => ipcRenderer.invoke('getStore', key),
  setStore: (key: string, value: any) => ipcRenderer.send('setStore', key, value),
  deleteStore: (key: string) => ipcRenderer.send('deleteStore', key),
  setIgnoreMouseEvent: (ignore: boolean) => ipcRenderer.send('setIgnoreMouseEvent', ignore),
  setEnableClickThrough: (enable: boolean) => ipcRenderer.send('setEnableClickThrough', enable),
  openFile: () => ipcRenderer.invoke('open-file'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  setChara: (folder, chara) => ipcRenderer.send('setChara', folder, chara),
  // getScreenShotResult: () => ipcRenderer.invoke('get-screen-shot-result'),

  onUpdateScreenShotResult: (callback: (value: string) => void) => ipcRenderer.on('update-screen-shot-result', (_, value) => callback(value)),
  // onUpdateApikey: (callback: (value: string) => void) => ipcRenderer.on('update-apikey', (_, value) => callback(value)),
  // onUpdateLLMModel: (callback: (value: string) => void) => ipcRenderer.on('update-llmModel', (_, value) => callback(value)),
  onUpdateLLMConfigs: (callback: (value: string) => void) => ipcRenderer.on('update-llmConfigs', (_, value) => callback(value)),
  onUpdateLLMModelName: (callback: (value: string) => void) => ipcRenderer.on('update-llmModelName', (_, value) => callback(value)),
  onUpdateTokenSaveMode: (callback: (value: string) => void) => ipcRenderer.on('update-tokenSaveMode', (_, value) => callback(value)),
  onUpdatePrompt: (callback: (value: string) => void) => ipcRenderer.on('update-prompt', (_, value) => callback(value)),
  onUpdateChara: (callback: (folder: string, chara: string) => void) => ipcRenderer.on('update-chara', (_, folder, chara) => callback(folder, chara)),
  onUpdateStyleName: (callback: (value: string) => void) => ipcRenderer.on('update-styleName', (_, value) => callback(value)),
  onUpdateSoVitsConfigs: (callback: (value: string) => void) => ipcRenderer.on('update-SoVitsConfigs', (_, value) => callback(value)),

  onUpdate(key: string, callback: (value: string) => void) {
    ipcRenderer.on(`update-${key}`, (_, value) => callback(value))
  },

  requestModel: (value: any) => ipcRenderer.send("requestModel", value),
  onModelValueRequested: (callback: (value: string) => void) => ipcRenderer.on("modelValueRequested", (_, value) => callback(value)),
  sendModelValue: (value: any) => ipcRenderer.send("sendModelValue", value),
  onModelValueReceived: (callback: (value: string) => void) => ipcRenderer.on("modelValueReceived", (_, value) => callback(value)),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
