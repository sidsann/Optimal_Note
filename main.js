const { ipcMain, app, BrowserWindow } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require('path');


// Initialize a database object
let db = new sqlite3.Database("myNotes.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});
db.run(
  `CREATE TABLE IF NOT EXISTS notes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`,
  (err) => {
    if (err) {
      console.error(err.message); // prints the error message to the console
    } else {
      console.log("Table created successfully or already exists");
      db.get('select count(*) as count from notes', function(err, row){
        if (!err && row.count === 0) {
          db.run(`INSERT INTO notes(title, content) VALUES(?,?)`, [`Title`, `content`], function(err){
            if(err) {
              console.error(err.message());
            } else {
              console.log(`A row has been inserted with rowid ${this.lastID}`);
            }
          });
        } else if (err) {
          console.error(err.message())
        }
      });
    }
  }
);






const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();  

  });
});

ipcMain.on("create-note", function() {
  db.run(`INSERT INTO notes(title, content) VALUES(?, ?)`, ['Title', 'content'], function(err) {
    if (err) {
      return console.error(err.message);
    } else {
    console.log(`A row has been inserted with rowid ${this.lastID}`);
    const note = {title: 'Title', content: 'content'};
    mainWindow.webContents.send('update-note', note);
    }
  });
});

/*
$('sidebarElement').on("contextmenu", (e) => {
  e.preventDefault();

})*/




app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
console.log("Hello from Electron 👋");

