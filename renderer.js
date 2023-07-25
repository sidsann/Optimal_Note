let title = document.getElementById("title");
let content = document.getElementById("content");
let sidebar = document.getElementById("leftSidebar");

document.addEventListener("DOMContentLoaded", domContentLoadedHandler, {
  once: true,
});

function domContentLoadedHandler() {
  addMainPageEventListeners();

  window.myAPI.onUpdateMainNote((event, noteTitle, noteContent) => {
    title.value = noteTitle;
    content.value = noteContent;
  });
  window.myAPI.onUpdateSidebar((event, allTitles) => {
    sidebar.innerHTML = "";

    allTitles.forEach((titleSidebar) => {
      let div = document.createElement("div");
      let span = document.createElement("span");
      span.textContent = titleSidebar;
      div.className = "clickable sidebarElement";
      sidebar.appendChild(div);
      div.appendChild(span);
      span.className = "sidebarElementText";
      div.addEventListener("click", () => {
        let chosenTitle = div.firstChild.textContent;
        window.myAPI.invokeSwitchNote(chosenTitle);
      });
    });
  });
}
function escapeZenHandler(event) {
  if (event.key === "Escape") {
    document.getElementById("topRow").classList.remove("offscreen-up");
    sidebar.classList.remove("offscreen-left");
    content.classList.add("textFadeOut");
    setTimeout(function () {
      content.classList.remove("zenMode");
      content.classList.remove("textFadeOut");
    }, 800);
    document.removeEventListener("keydown", escapeZenHandler);
  }
}

function enterTitleHandler(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    content.focus();
  }
}
function blurTitleHandler() {
  let titleContent = title.value;
  window.myAPI.invokeSaveTitle(titleContent);
}
function blurContentHandler() {
  let mainContent = content.value;
  window.myAPI.invokeSaveContent(mainContent);
}
async function clickStudyHandler() {
  let flashcards = await window.myAPI.invokeGetFlashcards(); //add error handling
  if (flashcards.length === 0) {
    window.myAPI.invokeDialog_Custom({
      type: "warning",
      buttons: ["Ok"],
      title: "Warning",
      message:
        "There are no flashcards for this note, please ensure that you have scanned your note.",
    });
  } else {
    main_fadeOut();
    setTimeout(async function () {
      document.addEventListener("keydown", escapeStudyHandler);
      await window.myAPI.invokeDialog_Custom({
        type: "info",
        buttons: ["Ok"],
        title: "Confirm",
        message: "Press esc to escape Study Mode.",
      });
      removeMainPageEventListeners();

      let front = true;
      let currentFlashcard = 0;

      let flashcardPage = document.createElement("div");
      flashcardPage.id = "flashcardPage";
      document.getElementById("main").appendChild(flashcardPage);

      let flashcardElement = document.createElement("div");
      let leftHalfPage = document.createElement("div");
      let rightHalfPage = document.createElement("div");

      leftHalfPage.id = "leftHalfPage";
      rightHalfPage.id = "rightHalfPage";
      leftHalfPage.classList.add("halfPage");
      rightHalfPage.classList.add("halfPage");
      flashcardPage.appendChild(leftHalfPage);
      flashcardPage.appendChild(rightHalfPage);
      flashcardElement.id = "flashcard";
      flashcardElement.textContent = flashcards[currentFlashcard].question;
      flashcardPage.appendChild(flashcardElement);
      let leftArrow = document.createElement("div");
      let rightArrow = document.createElement("div");
      leftArrow.classList.add("arrow");
      rightArrow.classList.add("arrow");
      leftArrow.id = "arrowLeft";
      rightArrow.id = "arrowRight";
      leftHalfPage.appendChild(leftArrow);
      rightHalfPage.appendChild(rightArrow);

      flashcardElement.addEventListener("click", clickFlashcardHandler);
      document.addEventListener("keydown", ArrowFlashcardHandler);
      leftHalfPage.addEventListener("click", previousFlashcard);
      rightHalfPage.addEventListener("click", nextFlashcard);

      function nextFlashcard() {
        if (currentFlashcard + 1 === flashcards.length) {
          window.myAPI.invokeDialog_Custom({
            type: "info",
            buttons: ["Ok"],
            title: "Info",
            message: "There are no more flashcards for this note!",
          });
        } else {
          flashcardElement.textContent =
            flashcards[++currentFlashcard].question;
        }
      }
      function previousFlashcard() {
        if (currentFlashcard === 0) {
          window.myAPI.invokeDialog_Custom({
            type: "info",
            buttons: ["Ok"],
            title: "Info",
            message: "You are already at the first flashcard in the set.",
          });
        } else {
          flashcardElement.textContent =
            flashcards[--currentFlashcard].question;
        }
      }
      function ArrowFlashcardHandler(event) {
        if (event.key === "ArrowRight") {
          nextFlashcard();
        } else if (event.key === "ArrowLeft") {
          previousFlashcard();
        } else if (event.key === " ") {
          clickFlashcardHandler();
        }
      }
      function clickFlashcardHandler() {
        front = !front;
        if (front) {
          flashcardElement.textContent = flashcards[currentFlashcard].question;
        } else {
          flashcardElement.textContent = flashcards[currentFlashcard].answer;
        }
      }
      function escapeStudyHandler(event) {
        if (event.key === "Escape") {
          window.myAPI.invokeUpdateSidebar();
          addMainPageEventListeners();
          removeStudyPageEventListeners();
          document.getElementById("flashcardPage").remove();
          document.removeEventListener("keydown", escapeStudyHandler);
          document.getElementById("topRow").classList.remove("offscreen-up");
          sidebar.classList.remove("offscreen-left");
          setTimeout(function () {
            content.classList.remove("textFadeOut");
          }, 800);
        }
      }
      function removeStudyPageEventListeners() {
        flashcardElement.removeEventListener("click", clickFlashcardHandler);
        document.removeEventListener("keydown", ArrowFlashcardHandler);
        leftHalfPage.removeEventListener("click", nextFlashcard);
        rightHalfPage.removeEventListener("click", previousFlashcard);
      }
    }, 1000);
  }
}

function clickZenHandler() {
  main_fadeOut();
  setTimeout(async function () {
    await window.myAPI.invokeDialog_Custom({
      type: "info",
      buttons: ["Ok"],
      title: "Confirm",
      message: "Press esc to escape Zen Mode.",
    });
    content.classList.add("zenMode");
    content.classList.remove("textFadeOut");
  }, 1000);

  document.addEventListener("keydown", escapeZenHandler);
}
function clickNewNoteHandler() {
  window.myAPI.invokeNewNote();
}
function clickScanHandler() {
  window.myAPI
    .invokeDialog_Custom({
      type: "question",
      buttons: ["Cancel", "Continue"],
      defaultId: 1,
      title: "Confirm",
      message:
        "In order to avoid redundancy, this operation will erase any flashcards that are associated with the current note. Is that alright?",
    })
    .then((result) => {
      if (result === 1) {
        window.myAPI.invokeScanNote();
      } else {
        // nothing happens
      }
    });
}
function addMainPageEventListeners() {
  document
    .getElementById("newNote")
    .addEventListener("click", clickNewNoteHandler);
  document.getElementById("scan").addEventListener("click", clickScanHandler);
  document.getElementById("zen").addEventListener("click", clickZenHandler);
  document.getElementById("study").addEventListener("click", clickStudyHandler);
  title.addEventListener("keydown", enterTitleHandler);
  title.addEventListener("blur", blurTitleHandler);
  content.addEventListener("blur", blurContentHandler);
}
function removeMainPageEventListeners() {
  sidebar.innerHTML = ""; //deleting sidebar elements deletes their corresponding event listeners
  //document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
  document
    .getElementById("newNote")
    .removeEventListener("click", clickNewNoteHandler);
  document
    .getElementById("scan")
    .removeEventListener("click", clickScanHandler);
  document.getElementById("zen").removeEventListener("click", clickZenHandler);
  document
    .getElementById("study")
    .removeEventListener("click", clickStudyHandler);
  title.removeEventListener("keydown", enterTitleHandler);
  title.removeEventListener("blur", blurTitleHandler);
  content.removeEventListener("blur", blurContentHandler);
}
function main_fadeOut() {
  document.getElementById("topRow").classList.add("offscreen-up");
  document.getElementById("leftSidebar").classList.add("offscreen-left");
  content.classList.add("textFadeOut");
}
