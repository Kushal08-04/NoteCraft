// === GLOBAL STATE ===
let folders = JSON.parse(localStorage.getItem("folders")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let archive = JSON.parse(localStorage.getItem("archive")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];
let user = JSON.parse(localStorage.getItem("user")) || null;

// === UTILS ===
function saveData() {
  localStorage.setItem("folders", JSON.stringify(folders));
  localStorage.setItem("notes", JSON.stringify(notes));
  localStorage.setItem("archive", JSON.stringify(archive));
  localStorage.setItem("trash", JSON.stringify(trash));
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

function randomColor() {
  const colors = ['#ffe4e1', '#e0ffff', '#e6e6fa', '#f0fff0', '#f5f5dc', '#f0f8ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// === UI RENDERING ===
function renderFolders() {
  const container = document.getElementById("folderContainer");
  container.innerHTML = "";
  folders.forEach((f, idx) => {
    const card = document.createElement("div");
    card.className = "folder-card";
    card.style.background = f.color;
    card.innerHTML = `
      <img src="https://i.ibb.co/LX7bk1VX/folder.png" width="40" />
      <h4>${f.name}</h4>
      <div class="dots-menu">
        <button onclick="archiveItem('folder', ${idx})">Archive</button>
        <button onclick="deleteItem('folder', ${idx})">Move to Trash</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderNotes() {
  const container = document.getElementById("notesContainer");
  container.innerHTML = "";
  notes.forEach((n, idx) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.background = n.color;
    card.innerHTML = `
      <img src="https://i.ibb.co/4RP0CCSd/note.png" width="40" />
      <h4>${n.title}</h4>
      <hr/>
      <p>${n.content}</p>
      <div class="dots-menu">
        <button onclick="archiveItem('note', ${idx})">Archive</button>
        <button onclick="deleteItem('note', ${idx})">Move to Trash</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderArchive() {
  const container = document.getElementById("archiveContainer");
  container.innerHTML = "";
  archive.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = item.type === "folder" ? "folder-card" : "note-card";
    card.style.background = item.color;
    card.innerHTML = `
      <h4>${item.title || item.name}</h4>
      ${item.content ? `<p>${item.content}</p>` : ""}
    `;
    container.appendChild(card);
  });
}

function renderTrash() {
  const container = document.getElementById("trashContainer");
  container.innerHTML = "";
  trash.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = item.type === "folder" ? "folder-card" : "note-card";
    card.style.background = item.color;
    card.innerHTML = `
      <h4>${item.title || item.name}</h4>
      ${item.content ? `<p>${item.content}</p>` : ""}
    `;
    container.appendChild(card);
  });
}

// === SECTION SWITCHING ===
function showSection(section) {
  const allSections = document.querySelectorAll(".section");
  allSections.forEach(s => s.style.display = "none");
  document.getElementById(section).style.display = "block";

  if (section === "archive") renderArchive();
  if (section === "trash") renderTrash();
  if (section === "calendar") renderCalendar(new Date());
}

// === ARCHIVE & TRASH ===
function archiveItem(type, index) {
  const item = type === "folder" ? folders.splice(index, 1)[0] : notes.splice(index, 1)[0];
  item.type = type;
  archive.push(item);
  saveData();
  renderFolders();
  renderNotes();
}

function deleteItem(type, index) {
  const item = type === "folder" ? folders.splice(index, 1)[0] : notes.splice(index, 1)[0];
  item.type = type;
  trash.push(item);
  saveData();
  renderFolders();
  renderNotes();
}

// === FORM HANDLER ===
document.getElementById("noteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const folder = document.getElementById("folder").value;
  const content = document.getElementById("content").value;
  const color = randomColor();

  if (folder) {
    folders.push({ name: folder, color });
  }

  notes.push({ title, content, color });
  saveData();
  renderFolders();
  renderNotes();
  e.target.reset();
});

// === PROFILE + LOGIN ===
document.getElementById("loginBtn").onclick = () => {
  const name = prompt("Enter your name:");
  if (name) {
    user = { name, img: "https://i.ibb.co/RkWxTFQn/default.png" };
    saveData();
    updateProfile();
  }
};

document.getElementById("logoutBtn").onclick = () => {
  user = null;
  localStorage.removeItem("user");
  updateProfile();
};

function updateProfile() {
  const nameSpan = document.getElementById("userName");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const profilePic = document.getElementById("profilePic");

  if (user) {
    nameSpan.innerText = user.name;
    profilePic.src = user.img;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    nameSpan.innerText = "";
    profilePic.src = "https://i.ibb.co/RkWxTFQn/default.png";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

document.getElementById("profileUpload").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    if (user) {
      user.img = e.target.result;
      saveData();
      updateProfile();
    }
  };
  reader.readAsDataURL(file);
});

// === CALENDAR GENERATION ===
function renderCalendar(date) {
  const container = document.getElementById("calendarView");
  container.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = date.toLocaleString("default", { month: "long" });
  container.innerHTML = `<h4>${monthName} ${year}</h4>`;

  const daysRow = document.createElement("div");
  daysRow.style.display = "grid";
  daysRow.style.gridTemplateColumns = "repeat(7, 1fr)";
  daysRow.style.gap = "6px";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
    const day = document.createElement("div");
    day.innerText = d;
    day.style.fontWeight = "bold";
    daysRow.appendChild(day);
  });

  for (let i = 0; i < firstDay; i++) {
    daysRow.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const box = document.createElement("div");
    box.innerText = d;
    box.style.padding = "6px";
    box.style.border = "1px solid #ccc";
    box.style.borderRadius = "6px";
    box.style.cursor = "pointer";
    box.onclick = () => {
      const reminder = prompt(`Set reminder for ${d} ${monthName} ${year}:`);
      if (reminder) {
        alert("Reminder saved (not persistent yet): " + reminder);
      }
    };
    daysRow.appendChild(box);
  }

  container.appendChild(daysRow);
}

// === INIT ===
function init() {
  renderFolders();
  renderNotes();
  updateProfile();
}

init();

// === REMINDER CALENDAR LOGIC (BACKEND INTEGRATION) ===
document.addEventListener('DOMContentLoaded', () => {
  const calendarBtn = document.querySelector('button[onclick*="calendar"]');
  const calendarContainer = document.getElementById('calendarContainer');
  const calendarBody = document.getElementById('calendarBody');
  const monthYearDisplay = document.getElementById('monthYear');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const reminderList = document.getElementById('reminderList');

  let currentDate = new Date();

  function fetchReminders() {
    fetch('/api/reminders')
      .then(res => res.json())
      .then(data => {
        renderReminders(data);
      });
  }

  function renderReminders(reminders) {
    reminderList.innerHTML = '';
    reminders.forEach(reminder => {
      const li = document.createElement('li');
      li.textContent = `${reminder.date}: ${reminder.text}`;
      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.onclick = () => deleteReminder(reminder.id);
      li.appendChild(delBtn);
      reminderList.appendChild(li);
    });
  }

  function deleteReminder(id) {
    fetch(`/api/reminders/${id}`, { method: 'DELETE' })
      .then(() => fetchReminders());
  }

  function addReminder(date, text) {
    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, text })
    })
    .then(res => res.json())
    .then(() => fetchReminders());
  }

  function renderCalendar(date) {
    calendarBody.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    let dateCount = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');
        if (i === 0 && j < firstDay) {
          cell.textContent = '';
        } else if (dateCount <= daysInMonth) {
          cell.textContent = dateCount;
          cell.classList.add('calendar-date');
          const cellDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dateCount).padStart(2, '0')}`;
          cell.addEventListener('click', () => {
            const note = prompt(`Add reminder for ${cellDate}:`);
            if (note) {
              addReminder(cellDate, note);
            }
          });
          dateCount++;
        } else {
          cell.textContent = '';
        }
        row.appendChild(cell);
      }
      calendarBody.appendChild(row);
    }
  }

  calendarBtn.addEventListener('click', () => {
    calendarContainer.classList.toggle('visible');
    renderCalendar(currentDate);
    fetchReminders();
  });

  prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });
});
