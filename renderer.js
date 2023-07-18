  
let title = document.getElementById("title");
let content = document.getElementById("content");

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("newNote").addEventListener("click", () => {
        window.myAPI.invokeNewNote();
    });
    title.addEventListener("keydown", (event) => {
        if(event.key === "Enter") {
            event.preventDefault();
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
    window.myAPI.onUpdateMainNote((event, noteTitle, noteContent) => {
        title.value = noteTitle;
        content.value = noteContent;
    });
    window.myAPI.onUpdateSidebar((event, allTitles) => {
        let sideBar = document.getElementById("leftSidebar");
        sideBar.innerHTML = "";

        allTitles.forEach((titleSidebar) => {
            let div = document.createElement("div");
            let span = document.createElement("span");
            span.textContent = titleSidebar;
            div.className = "clickable sidebarElement";
            sideBar.appendChild(div);
            div.appendChild(span);
            span.className = "sidebarElementText";
            div.addEventListener("click", ()=> {
                let chosenTitle = div.firstChild.textContent;
                window.myAPI.invokeSwitchNote(chosenTitle);
            });
        });
    });

});



