let title = document.getElementById("title");
let content = document.getElementById("content");

document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("newNote").addEventListener("click", () => {
    window.myAPI.invokeNewNote();
  });
  document.getElementById("scan").addEventListener("click", () => {
    window.myAPI
      .invokeDialog_DeleteFlashcards({
        type: "question",
        buttons: ["Cancel", "Continue"],
        defaultId: 1,
        title: "Confirm",
        message:
          "In order to avoid redundancy, this operation will erase any flashcards that are associated with the current note. Is that alright?",
      })
      .then((result) => {
        if (result.response === 1) {
          window.myAPI.invokeScanNote();
        } else {
          // nothing happens
        }
      });
  });
  document.getElementById("zen").addEventListener("click", () => {
    document.getElementById("topRow").classList.add("offscreen-up");
    document.getElementById("leftSidebar").classList.add("offscreen-left");
    content.classList.add("textFadeOut");
    setTimeout(function () {
      alert("Press esc to escape Zen Mode.");
      content.classList.add("zenMode");
      content.classList.remove("textFadeOut");
    }, 1000);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.getElementById("topRow").classList.remove("offscreen-up");
      document.getElementById("leftSidebar").classList.remove("offscreen-left");
      content.classList.add("textFadeOut");
      setTimeout(function () {
        content.classList.remove("zenMode");
        content.classList.remove("textFadeOut");
      }, 800);
    }
  });
  title.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
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
      div.addEventListener("click", () => {
        let chosenTitle = div.firstChild.textContent;
        window.myAPI.invokeSwitchNote(chosenTitle);
      });
    });
  });

  window.myAPI.onFinishedScanning(() => {
    alert(
      "Note scanned, click 'Study' in order to review the generated flashcards."
    );
  });
});
