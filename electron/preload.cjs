const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cineNeonAPI', {
  importarVideo: () => {
    return ipcRenderer.invoke('cineneon:importar-video')
  }
})
