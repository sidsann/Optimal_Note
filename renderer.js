const { ipcRenderer } = require("electron");

window.onload = function() {
    $("#newNote").on("click", () => {
        window.myAPI.send("create-note");
    });
    ipcRenderer.on('update-note', (event, note) => {
        $('#title').text(note.title);
        $('#content').text(note.content);
    })
};





