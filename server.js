const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let notes = [];
let recentFolders = [];

app.get("/api/notes", (req, res) => {
  res.json({ notes, recentFolders });
});

app.post("/api/notes", (req, res) => {
  const { title, content, folder } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: "Title and content required." });
  }

  const note = {
    id: uuidv4(),
    title,
    content,
    folder: folder || "General",
    date: new Date().toLocaleString(),
  };

  notes.push(note);

  // Update recent folders
  if (note.folder && !recentFolders.includes(note.folder)) {
    recentFolders.unshift(note.folder);
    if (recentFolders.length > 5) recentFolders.pop(); // keep only latest 5
  }

  res.json({ success: true, note });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
