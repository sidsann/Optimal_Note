const {
  ipcMain,
  app,
  BrowserWindow,
  dialog,
  nativeImage,
} = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3");
const generateFlashcards = require("./generateFlashcards.js");

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
  title TEXT DEFAULT '' PRIMARY KEY,
  content TEXT DEFAULT '',
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
  (err) => {
    if (!err) {
      console.log("Table created successfully or already exists");
      db.get(`SELECT COUNT(*) AS count FROM notes`, (err, row) => {
        if (err) {
          console.error(err.message);
        } else if (row.count === 0) {
          createNote();
        }
      });
    } else {
      console.error(err.message);
    }
  }
);
db.run(
  `CREATE TABLE IF NOT EXISTS q_and_a_pairs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_title TEXT,
  question TEXT,
  answer TEXT,
  FOREIGN KEY(note_title) REFERENCES notes(title)
)`,
  (err) => {
    if (!err) {
      console.log("Q&A table created successfully or already exists");
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
      updateSidebar();
    });

    ipcMain.handle("newNote", () => {
      createNote();
      return null;
    });
    ipcMain.handle("dialog_DeleteFlashcards", (event, options) => {
      const image = nativeImage.createFromPath(`${__dirname}/assets/note.png`);
      options.icon = image;
      let result = dialog.showMessageBoxSync(options);
      return result;
    });
    ipcMain.handle("scanNote", async () => {
      try {
        let content = await getContent();
        let result = await generateFlashcards(content);
        let title = await getTitle();
        await deleteCurrentFlashcards(title);
        await update_QA_Table(result, title);
        win.webContents.send("finishedScanning");
      } catch (err) {
        console.error(err.message);
      }
    });
    ipcMain.handle("saveTitle", (event, titleContent) => {
      saveTitle(titleContent);
      return null;
    });
    ipcMain.handle("saveContent", (event, mainContent) => {
      saveContent(mainContent);
      return null;
    });
    ipcMain.handle("switchNote", (event, title) => {
      db.run(
        `UPDATE notes SET last_accessed = CURRENT_TIMESTAMP WHERE title = ?`,
        [title],
        (err) => {
          if (err) {
            console.error(err.message);
          } else {
            updateSidebar();
            updateMainNote();
          }
        }
      );
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
        showDialog_DuplicateTitle();
      } else {
        console.error(err.message);
      }
    }
    updateSidebar();
    updateMainNote();
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
        if (err.message.includes("UNIQUE constraint failed")) {
          showDialog_DuplicateTitle();
        } else {
          console.error(err.message);
        }
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
  db.run(
    `UPDATE notes SET content = ? WHERE last_accessed = (SELECT MAX(last_accessed) FROM notes)`,
    [mainContent],
    (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`content has been saved: ${mainContent}!`);
      }
    }
  );
}
function updateSidebar() {
  db.all(`SELECT title FROM notes ORDER BY last_accessed DESC`, (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      let allTitles = rows.map((row) => row.title);
      win.webContents.send("updateSidebar", allTitles);
      console.log("Got all the note titles from the database!");
    }
  });
}
function getContent() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT content FROM notes WHERE last_accessed = (SELECT MAX(last_accessed) FROM notes)`,
      (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row.content);
        }
      }
    );
  });
}
function getTitle() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT title FROM notes WHERE last_accessed = (SELECT MAX(last_accessed) FROM notes)`,
      (err, row) => {
        if (err) {
          reject(err.message);
        } else {
          resolve(row.title);
        }
      }
    );
  });
}
function update_QA_Table(result, title) {
  result.forEach((record) => {
    db.run(
      `INSERT INTO q_and_a_pairs(note_title, question, answer) VALUES(?, ?, ?)`,
      [title, record.fields.Question, record.fields.Answer],
      (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`Inserted Q&A pair into the database`);
        }
      }
    );
  });
}
function deleteCurrentFlashcards(title) {
  db.run(`DELETE FROM q_and_a_pairs WHERE note_title = ?`, [title], (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Successfully deleted old flashcards.");
    }
  });
}
function showDialog_DuplicateTitle() {
  const image = nativeImage.createFromPath(`${__dirname}/assets/note.png`);

  dialog.showMessageBoxSync({
    type: "warning",
    buttons: ['Ok'],
    title: "Warning",
    message: 'Please ensure that each note has a unique title.',
    icon: image,
  });
}
