const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'myAPI', { 
        invokeNewNote: () => ipcRenderer.invoke('newNote'),
        invokeScanNote: () => ipcRenderer.invoke('scanNote'),
        invokeSaveTitle: (titleContent) => ipcRenderer.invoke('saveTitle', titleContent),
        invokeSaveContent: (mainContent) => ipcRenderer.invoke('saveContent', mainContent),
        invokeSwitchNote: (title) => ipcRenderer.invoke('switchNote', title),
        invokeUpdateSidebar: () => ipcRenderer.invoke('updateSidebar'),
        invokeDialog_Custom: (options) => ipcRenderer.invoke('dialog_Custom', options),
        invokeGetFlashcards: () => ipcRenderer.invoke('getFlashcards'),
        onUpdateMainNote: (callback) => ipcRenderer.on('updateMainNote', callback),
        onUpdateSidebar: (callback) => ipcRenderer.on('updateSidebar', callback),
    }
);

