  
let title = document.getElementById("title");
let content = document.getElementById("content");

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("newNote").addEventListener("click", () => {
        window.myAPI.invokeNewNote();
    });
    title.addEventListener("keydown", (event) => {
        if(event.key === "Enter") {
            //let titleContent = title.textContent;
            event.preventDefault();
            //window.myAPI.saveTitle(titleContent);
            content.focus();
        }
    });
    title.addEventListener("blur", () => {
        let titleContent = title.value;
        window.myAPI.invokeSaveTitle(titleContent);
    });
    content.addEventListener("blur", () => {
        let mainContent = content.value;
        window.myAPI.invokeSaveContent(mainContent);
    });
    window.myAPI.onAlertChangeTitle(() => {
        alert("Please ensure that each note has a unique title.");
    });
    window.myAPI.onUpdateMainNote(function (event, noteTitle, noteContent) {
        title.value = noteTitle;
        content.value = noteContent;
    });
});



