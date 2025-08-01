let notes = JSON.parse(localStorage.getItem("notes") || "[]");
let archived = JSON.parse(localStorage.getItem("archive") || "[]");
let trashed = JSON.parse(localStorage.getItem("trash") || "[]");

const sections = {
  dashboard: document.getElementById("dashboardView"),
  add: document.getElementById("addNewView"),
  calendar: document.getElementById("calendarView"),
  archive: document.getElementById("archiveView"),
  trash: document.getElementById("trashView")
};

// NAVIGATION
document.querySelectorAll(".nav-item").forEach(item => {
  item.onclick = () => {
    Object.values(sections).forEach(sec => sec.classList.add("hidden"));
    sections[item.dataset.section].classList.remove("hidden");
    if (item.dataset.section === "calendar") drawCalendar();
    if (item.dataset.section === "archive") renderArchive();
    if (item.dataset.section === "trash") renderTrash();
    if (item.dataset.section === "dashboard") renderDashboard();
  };
});

function saveNote() {
  const title = document.getElementById("noteTitle").value;
  const folder = document.getElementById("noteFolder").value;
  const content = document.getElementById("noteContent").value;
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

function renderDashboard() {
  const folders = document.getElementById("folders");
  const notesDiv = document.getElementById("notes");
  folders.innerHTML = "";
  notesDiv.innerHTML = "";

  const folderMap = {};
  notes.forEach(note => {
    folderMap[note.folder] = folderMap[note.folder] || [];
    folderMap[note.folder].push(note);
  });

  Object.keys(folderMap).forEach(folder => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${folder}</strong><div class="menu">⋮</div>`;
    addCardMenu(div, note => moveToTrash(note), folder);
    folders.appendChild(div);
  });

  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<strong>${note.title}</strong><p>${note.content}</p><div class="menu">⋮</div>`;
    addCardMenu(div, note => moveToTrash(note), note);
    notesDiv.appendChild(div);
  });
}

function addCardMenu(card, callback, noteData) {
  const menu = card.querySelector(".menu");
  const menuBox = document.createElement("div");
  menuBox.className = "menu-options";
  menuBox.innerHTML = `
    <button onclick="archiveNote(${JSON.stringify(noteData).replace(/"/g, "'")})">Archive</button>
    <button onclick="moveToTrash(${JSON.stringify(noteData).replace(/"/g, "'")})">Trash</button>`;
  card.appendChild(menuBox);
  menu.onclick = e => {
    e.stopPropagation();
    document.querySelectorAll(".menu-options").forEach(m => m.classList.remove("show"));
    menuBox.classList.toggle("show");
  };
  window.addEventListener("click", () => menuBox.classList.remove("show"));
}

function moveToTrash(note) {
  trashed.push(note);
  notes = notes.filter(n => n.title !== note.title);
  localStorage.setItem("trash", JSON.stringify(trashed));
  localStorage.setItem("notes", JSON.stringify(notes));
  renderDashboard();
}

function archiveNote(note) {
  archived.push(note);
  notes = notes.filter(n => n.title !== note.title);
  localStorage.setItem("archive", JSON.stringify(archived));
  localStorage.setItem("notes", JSON.stringify(notes));
  renderDashboard();
}

function renderTrash() {
  const trash = document.getElementById("trashNotes");
  const empty = document.getElementById("emptyTrash");
  trash.innerHTML = "";
  empty.classList.toggle("hidden", trashed.length !== 0);

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
      document.querySelectorAll(".menu-options").forEach(m => m.classList.remove("show"));
      menuBox.classList.toggle("show");
    };
    trash.appendChild(div);
  });
}

function renderArchive() {
  const arch = document.getElementById("archiveNotes");
  const empty = document.getElementById("emptyArchive");
  arch.innerHTML = "";
  empty.classList.toggle("hidden", archived.length !== 0);

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
      document.querySelectorAll(".menu-options").forEach(m => m.classList.remove("show"));
      menuBox.classList.toggle("show");
    };
    arch.appendChild(div);
  });
}

function restoreNote(note) {
  notes.push(note);
  trashed = trashed.filter(n => n.title !== note.title);
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("trash", JSON.stringify(trashed));
  renderTrash();
}

function unarchiveNote(note) {
  notes.push(note);
  archived = archived.filter(n => n.title !== note.title);
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("archive", JSON.stringify(archived));
  renderArchive();
}

// FULL CALENDAR
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function drawCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const title = document.getElementById("calendarTitle");
  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = firstDay.getDay();

  title.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${currentYear}`;

  for (let i = 0; i < startDay; i++) {
    const blank = document.createElement("div");
    blank.className = "calendar-day blank";
    calendar.appendChild(blank);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement("div");
    day.className = "calendar-day";
    day.textContent = d;
    calendar.appendChild(day);
  }
}

document.getElementById("prevMonth").onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  drawCalendar();
};

document.getElementById("nextMonth").onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  drawCalendar();
};

// Account icon dropdown
const accountIcon = document.querySelector(".account-icon");
const accountMenu = document.querySelector(".account-menu");

accountIcon.addEventListener("click", e => {
  e.stopPropagation();
  accountMenu.classList.toggle("hidden");
});

window.addEventListener("click", () => {
  accountMenu.classList.add("hidden");
});

document.getElementById("loginBtn").onclick = () => {
  alert("Login clicked (connect with backend)");
};
document.getElementById("logoutBtn").onclick = () => {
  alert("Logout clicked (connect with backend)");
};

// Start
renderDashboard();
