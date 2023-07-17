const { ipcMain, app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3");

let win; //BrowserWindow variable declared
// Initialize a database object
let db = new sqlite3.Database("myNotes.db", (err) => {
  if (!err) {
    console.log("Connected to the in-memory SQlite database.");
  } else {
    console.error(err.message);
  }
});

db.run(
  `CREATE TABLE IF NOT EXISTS notes(
  title TEXT DEFAULT 'Title' PRIMARY KEY,
  content TEXT DEFAULT 'content',
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
  (err) => {
    if (!err) {
      console.log("Table created successfully or already exists");
      createNote();
    } else {
      console.error(err.message);
    }
  }
);
const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 400,
    //icon: `${__dirname}/assets/note.ico`,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");
};

app
  .whenReady()
  .then(() => {
    if (process.platform === "darwin") {
      // mac specific, set icon to note png
      app.dock.setIcon(`${__dirname}/assets/note.png`);
    }
    createWindow();
  })
  .then(() => {
    
    
    win.webContents.on("did-finish-load", () => {
      updateMainNote();
    });

    ipcMain.handle("newNote", () => {
      createNote();
      return null;
    });
    ipcMain.handle("saveTitle", (event, titleContent) => {
      saveTitle(titleContent);
      return null;
    });
    ipcMain.handle("saveContent", (event, mainContent) => {
      saveContent(mainContent);
      return null;
    });
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      win.webContents.on("did-finish-load", () => {
        updateMainNote();
      });   
     });
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function createNote() {
  db.run(`INSERT INTO notes DEFAULT VALUES`, function (err) {
    if (!err) {
      console.log(`A row has been inserted`);
    } else {
      if (err.message.includes("UNIQUE constraint failed")) {
        win.webContents.send("alert_changeTitle");
      } else {
        console.error(err.message);
      }
    }
  });
}

function saveTitle(titleContent) {
  db.run(
    `UPDATE notes SET title = ? WHERE last_accessed = (SELECT MAX(last_accessed) FROM notes)`,
    [titleContent],
    function (err) {
      if (!err) {
        console.log(
          `Updated the most recently accessed note with the new title content: ${titleContent}`
        );
      } else {
        console.error(err.message);
      }
    }
  );
}

function updateMainNote() {
  db.get(
    `SELECT title, content FROM notes ORDER BY last_accessed DESC LIMIT 1`,
    (err, row) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(row.title);
        console.log(row.content);
        win.webContents.send("updateMainNote", row.title, row.content);
      }
    }
  );
}

function saveContent(mainContent) {
  db.run(`UPDATE notes SET content = ? WHERE last_accessed = (SELECT MAX(last_accessed) FROM notes)`,
  [mainContent],
   (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`content has been saved: ${mainContent}!`);
    }
  })
}
