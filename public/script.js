const state = {
  notes: [],
  reminders: [],
  currentView: 'dashboard'
};

// Init
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadNotes();
  loadCalendar();
  loadReminders();
});

function setupEventListeners() {
  document.getElementById("dashboardBtn").onclick = showDashboard;
  document.getElementById("addNewBtn").onclick = () => showSection("addNewSection");
  document.getElementById("calendarBtn").onclick = () => showSection("calendarSection");
  document.getElementById("archiveBtn").onclick = () => showSection("archiveSection");
  document.getElementById("trashBtn").onclick = () => showSection("trashSection");
  document.getElementById("saveNoteBtn").onclick = saveNote;
  document.getElementById("searchInput").addEventListener("input", handleSearch);
  document.getElementById("accountIcon").onclick = toggleAccountMenu;
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.account-menu')) {
      document.getElementById("accountPopup").classList.add("hidden");
    }
  });
}

function showSection(id) {
  ["dashboardSection", "addNewSection", "calendarSection", "archiveSection", "trashSection"].forEach(sec => {
    document.getElementById(sec).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
  state.currentView = id;
}

function toggleAccountMenu() {
  const popup = document.getElementById("accountPopup");
  popup.classList.toggle("hidden");
}

function saveNote() {
  const title = document.getElementById("noteTitle").value;
  const folder = document.getElementById("folderName").value;
  const content = document.getElementById("noteContent").value;
  if (!title && !content) return;

  const note = {
    id: Date.now(),
    title,
    folder,
    content,
    status: "active",
    date: new Date().toLocaleDateString()
  };

  state.notes.push(note);
  localStorage.setItem("notes", JSON.stringify(state.notes));
  loadNotes();
  showDashboard();
}

function loadNotes() {
  state.notes = JSON.parse(localStorage.getItem("notes")) || [];
  const foldersEl = document.getElementById("recentFolders");
  const notesEl = document.getElementById("myNotes");
  const archived = document.getElementById("archivedItems");
  const trashed = document.getElementById("trashedItems");

  foldersEl.innerHTML = "";
  notesEl.innerHTML = "";
  archived.innerHTML = "";
  trashed.innerHTML = "";

  const folderSet = new Set();

  state.notes.forEach(note => {
    const el = document.createElement("div");
    const colors = ["#fef3c7", "#fbcfe8", "#bae6fd", "#bbf7d0"];
    el.className = "note-card";
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    el.innerHTML = `<strong>${note.title}</strong><br>${note.content}<div class="note-options">⋮</div>`;
    const menu = document.createElement("div");
    menu.className = "note-menu hidden";

    if (note.status === "active") {
      menu.innerHTML = `<button onclick="archiveNote(${note.id})">Archive</button><button onclick="trashNote(${note.id})">Trash</button>`;
      if (note.folder) {
        if (!folderSet.has(note.folder)) {
          foldersEl.appendChild(el.cloneNode(true));
          folderSet.add(note.folder);
        }
      } else {
        notesEl.appendChild(el);
      }
    } else if (note.status === "archived") {
      menu.innerHTML = `<button onclick="unarchiveNote(${note.id})">Unarchive</button>`;
      archived.appendChild(el);
    } else if (note.status === "trashed") {
      menu.innerHTML = `<button onclick="deleteNote(${note.id})">Delete</button><button onclick="restoreNote(${note.id})">Restore</button>`;
      trashed.appendChild(el);
    }
  });
}

function archiveNote(id) {
  updateNoteStatus(id, "archived");
}
function trashNote(id) {
  updateNoteStatus(id, "trashed");
}
function restoreNote(id) {
  updateNoteStatus(id, "active");
}
function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  localStorage.setItem("notes", JSON.stringify(state.notes));
  loadNotes();
}
function unarchiveNote(id) {
  updateNoteStatus(id, "active");
}
function updateNoteStatus(id, status) {
  const note = state.notes.find(n => n.id === id);
  if (note) note.status = status;
  localStorage.setItem("notes", JSON.stringify(state.notes));
  loadNotes();
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const allCards = document.querySelectorAll(".note-card");
  allCards.forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? "block" : "none";
  });
}

function loadCalendar() {
  const container = document.getElementById("calendarContainer");
  container.innerHTML = "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach(d => container.innerHTML += `<div><strong>${d}</strong></div>`);

  const date = new Date();
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const firstDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  for (let i = 0; i < firstDay; i++) container.innerHTML += `<div></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = d;
    cell.onclick = () => {
      const reminder = prompt("Add reminder for " + d);
      if (reminder) {
        state.reminders.push({ day: d, text: reminder });
        localStorage.setItem("reminders", JSON.stringify(state.reminders));
        alert("Reminder saved!");
      }
    };
    container.appendChild(cell);
  }
}

function loadReminders() {
  state.reminders = JSON.parse(localStorage.getItem("reminders")) || [];
}

function showDashboard() {
  showSection("dashboardSection");
}
