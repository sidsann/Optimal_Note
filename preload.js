const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'myAPI', { 
        invokeNewNote: () => ipcRenderer.invoke('newNote'),
        invokeScanNote: () => ipcRenderer.invoke('scanNote'),
        invokeSaveTitle: (titleContent) => ipcRenderer.invoke('saveTitle', titleContent),
        invokeSaveContent: (mainContent) => ipcRenderer.invoke('saveContent', mainContent),
        invokeSwitchNote: (title) => ipcRenderer.invoke('switchNote', title),
        invokeDialog_DeleteFlashcards: (options) => ipcRenderer.invoke('dialog_DeleteFlashcards', options),
        onUpdateMainNote: (callback) => ipcRenderer.on('updateMainNote', callback),
        onUpdateSidebar: (callback) => ipcRenderer.on('updateSidebar', callback),
        onFinishedScanning: (callback) => ipcRenderer.on('finishedScanning', callback),
    }
);

