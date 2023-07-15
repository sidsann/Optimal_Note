const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'myAPI', { 
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["create-note", "update-note"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        }
    }
);

