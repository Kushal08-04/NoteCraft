let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let trashedNotes = JSON.parse(localStorage.getItem("trash") || "[]");
let archivedNotes = JSON.parse(localStorage.getItem("archive") || "[]");

function saveNote() {
  const title = document.getElementById("noteTitle").value;
  const folder = document.getElementById("noteFolder").value;
  const content = document.getElementById("noteContent").value;
  if (!title || !content) return alert("Fill all fields");
  notes.push({ title, folder, content, date: new Date() });
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
  toggleAddNew(false);
}

function renderNotes() {
  const notesEl = document.getElementById("myNotes");
  const foldersEl = document.getElementById("recentFolders");
  notesEl.innerHTML = "";
  foldersEl.innerHTML = "";

  let folderSet = new Set();
  notes.forEach(note => {
    const noteEl = document.createElement("div");
    noteEl.className = "note-card";
    noteEl.innerHTML = `<strong>${note.title}</strong><p>${note.content}</p>
    <div class="actions">
      <button onclick="trashNote('${note.title}')">🗑️</button>
      <button onclick="archiveNote('${note.title}')">📦</button>
    </div>`;
    notesEl.appendChild(noteEl);

    if (!folderSet.has(note.folder)) {
      folderSet.add(note.folder);
      const folderEl = document.createElement("div");
      folderEl.className = "folder-card";
      folderEl.innerHTML = `<strong>${note.folder}</strong>`;
      foldersEl.appendChild(folderEl);
    }
  });
}

function trashNote(title) {
  const index = notes.findIndex(n => n.title === title);
  trashedNotes.push(notes[index]);
  notes.splice(index, 1);
  updateAll();
}

function archiveNote(title) {
  const index = notes.findIndex(n => n.title === title);
  archivedNotes.push(notes[index]);
  notes.splice(index, 1);
  updateAll();
}

function updateAll() {
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("trash", JSON.stringify(trashedNotes));
  localStorage.setItem("archive", JSON.stringify(archivedNotes));
  renderNotes();
  showSection("dashboard");
}

function showSection(id) {
  document.getElementById("dashboardView").style.display = "none";
  document.getElementById("calendarView").style.display = "none";
  document.getElementById("archiveView").style.display = "none";
  document.getElementById("trashView").style.display = "none";
  document.getElementById(`${id}View`).style.display = "block";

  if (id === "archive") renderArchive();
  if (id === "trash") renderTrash();
  if (id === "calendar") renderCalendar();
}

function renderArchive() {
  const archiveEl = document.getElementById("archivedNotes");
  archiveEl.innerHTML = archivedNotes.length ? "" : "<p class='empty-message'>Nothing in Archive</p>";
  archivedNotes.forEach(n => {
    const el = document.createElement("div");
    el.className = "note-card";
    el.innerHTML = `<strong>${n.title}</strong><p>${n.content}</p>`;
    archiveEl.appendChild(el);
  });
}

function renderTrash() {
  const trashEl = document.getElementById("trashedNotes");
  trashEl.innerHTML = trashedNotes.length ? "" : "<p class='empty-message'>Nothing in Trash</p>";
  trashedNotes.forEach(n => {
    const el = document.createElement("div");
    el.className = "note-card";
    el.innerHTML = `<strong>${n.title}</strong><p>${n.content}</p>`;
    trashEl.appendChild(el);
  });
}

function renderCalendar() {
  const cal = document.getElementById("calendarContainer");
  const now = new Date();
  cal.innerHTML = `<p><strong>${now.toDateString()}</strong></p>`;
}

function toggleAddNew(force) {
  const form = document.getElementById("addNewForm");
  form.style.display = (force === false || form.style.display === "block") ? "none" : "block";
}

function searchNotes() {
  const query = document.getElementById("searchBar").value.toLowerCase();
  document.querySelectorAll("#myNotes .note-card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? "block" : "none";
  });
}

function toggleAccountMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById("accountMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", (e) => {
  const acc = document.querySelector(".account-container");
  if (!acc.contains(e.target)) document.getElementById("accountMenu").style.display = "none";
});

function login() { alert("Login clicked"); }
function logout() { alert("Logout clicked"); }

renderNotes();
