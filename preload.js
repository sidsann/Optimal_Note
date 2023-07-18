const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld(
    'myAPI', { 
        invokeNewNote: () => ipcRenderer.invoke('newNote'),
        invokeSaveTitle: (titleContent) => ipcRenderer.invoke('saveTitle', titleContent),
        invokeSaveContent: (mainContent) => ipcRenderer.invoke('saveContent', mainContent),
        invokeSwitchNote: (title) => ipcRenderer.invoke('switchNote', title),
        onAlertChangeTitle: (callback) => ipcRenderer.on('alert_changeTitle', callback),
        onUpdateMainNote: (callback) => ipcRenderer.on('updateMainNote', callback),
        onUpdateSidebar: (callback) => ipcRenderer.on('updateSidebar', callback),
    }
);

