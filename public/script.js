let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let archived = JSON.parse(localStorage.getItem("archive") || "[]");
let trashed = JSON.parse(localStorage.getItem("trash") || "[]");

// Sections mapped by data-section
const sections = {
  dashboard: document.getElementById("dashboardView"),
  add: document.getElementById("addNewView"),
  calendar: document.getElementById("calendarView"),
  archive: document.getElementById("archiveView"),
  trash: document.getElementById("trashView")
};

// Navigation click handler
document.querySelectorAll(".nav-item").forEach(item => {
  item.onclick = () => {
    Object.values(sections).forEach(sec => sec.classList.add("hidden"));
    sections[item.dataset.section].classList.remove("hidden");

    switch (item.dataset.section) {
      case "dashboard": renderDashboard(); break;
      case "calendar": drawCalendar(); break;
      case "archive": renderArchive(); break;
      case "trash": renderTrash(); break;
    }
  };
});

// Save new note
function saveNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const folder = document.getElementById("noteFolder").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  if (title && folder && content) {
    notes.push({ title, folder, content });
    localStorage.setItem("notes", JSON.stringify(notes));
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteFolder").value = "";
    document.getElementById("noteContent").value = "";
    renderDashboard();
    sections.add.classList.add("hidden");
    sections.dashboard.classList.remove("hidden");
  }
}

// Render dashboard
function renderDashboard() {
  const folders = document.getElementById("folders");
  const notesDiv = document.getElementById("notes");
  folders.innerHTML = "";
  notesDiv.innerHTML = "";

  const folderMap = {};
  notes.forEach(note => {
    if (!folderMap[note.folder]) folderMap[note.folder] = [];
    folderMap[note.folder].push(note);
  });

  Object.keys(folderMap).forEach(folder => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${folder}</strong><div class="menu">⋮</div>`;
    addCardMenu(div, folderMap[folder][0], true);
    folders.appendChild(div);
  });

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${note.title}</strong><p>${note.content}</p><div class="menu">⋮</div>`;
    addCardMenu(div, note);
    notesDiv.appendChild(div);
  });
}

// Add 3-dot menu to card
function addCardMenu(card, noteData, isFolder = false) {
  const menu = card.querySelector(".menu");
  const menuBox = document.createElement("div");
  menuBox.className = "menu-options";
  menuBox.innerHTML = `
    <button onclick="archiveNote(${JSON.stringify(noteData).replace(/"/g, "'")})">Archive</button>
    <button onclick="moveToTrash(${JSON.stringify(noteData).replace(/"/g, "'")})">Trash</button>
  `;
  card.appendChild(menuBox);
  menu.onclick = e => {
    e.stopPropagation();
    document.querySelectorAll(".menu-options").forEach(m => m.classList.remove("show"));
    menuBox.classList.toggle("show");
  };
}

// Hide menu on outside click
window.addEventListener("click", () => {
  document.querySelectorAll(".menu-options").forEach(m => m.classList.remove("show"));
});

// Move note to trash
function moveToTrash(note) {
  trashed.push(note);
  notes = notes.filter(n => n.title !== note.title);
  localStorage.setItem("trash", JSON.stringify(trashed));
  localStorage.setItem("notes", JSON.stringify(notes));
  renderDashboard();
}

// Archive a note
function archiveNote(note) {
  archived.push(note);
  notes = notes.filter(n => n.title !== note.title);
  localStorage.setItem("archive", JSON.stringify(archived));
  localStorage.setItem("notes", JSON.stringify(notes));
  renderDashboard();
}

// Trash view
function renderTrash() {
  const trash = document.getElementById("trashNotes");
  const empty = document.getElementById("emptyTrash");
  trash.innerHTML = "";
  if (trashed.length === 0) empty.classList.remove("hidden");
  else empty.classList.add("hidden");

  trashed.forEach(note => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${note.title}</strong><p>${note.content}</p><div class="menu">⋮</div>`;
    const menuBox = document.createElement("div");
    menuBox.className = "menu-options";
    menuBox.innerHTML = `<button onclick="restoreNote(${JSON.stringify(note).replace(/"/g, "'")})">Restore</button>`;
    div.appendChild(menuBox);
    div.querySelector(".menu").onclick = e => {
      e.stopPropagation();
      menuBox.classList.toggle("show");
    };
    trash.appendChild(div);
  });
}

// Archive view
function renderArchive() {
  const arch = document.getElementById("archiveNotes");
  const empty = document.getElementById("emptyArchive");
  arch.innerHTML = "";
  if (archived.length === 0) empty.classList.remove("hidden");
  else empty.classList.add("hidden");

  archived.forEach(note => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${note.title}</strong><p>${note.content}</p><div class="menu">⋮</div>`;
    const menuBox = document.createElement("div");
    menuBox.className = "menu-options";
    menuBox.innerHTML = `<button onclick="unarchiveNote(${JSON.stringify(note).replace(/"/g, "'")})">Unarchive</button>`;
    div.appendChild(menuBox);
    div.querySelector(".menu").onclick = e => {
      e.stopPropagation();
      menuBox.classList.toggle("show");
    };
    arch.appendChild(div);
  });
}

// Restore from trash
function restoreNote(note) {
  notes.push(note);
  trashed = trashed.filter(n => n.title !== note.title);
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("trash", JSON.stringify(trashed));
  renderTrash();
}

// Unarchive
function unarchiveNote(note) {
  notes.push(note);
  archived = archived.filter(n => n.title !== note.title);
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("archive", JSON.stringify(archived));
  renderArchive();
}

// Calendar rendering
function drawCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    calendar.appendChild(empty);
  }

  for (let d = 1; d <= days; d++) {
    const day = document.createElement("div");
    day.className = "calendar-day";
    day.textContent = d;
    calendar.appendChild(day);
  }
}

// Account menu toggle logic
const accountIcon = document.querySelector(".account-icon");
const accountMenu = document.querySelector(".account-menu");

accountIcon.addEventListener("click", e => {
  e.stopPropagation();
  accountMenu.classList.toggle("hidden");
});

window.addEventListener("click", () => {
  accountMenu.classList.add("hidden");
});

// On page load
renderDashboard();
