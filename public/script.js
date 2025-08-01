// ========== Constants & Initial Setup ==========
const sidebarItems = document.querySelectorAll('.sidebar-item');
const views = document.querySelectorAll('.view');
const addNewBtn = document.getElementById('addNewBtn');
const saveBtn = document.getElementById('saveBtn');
const folderInput = document.getElementById('folderInput');
const titleInput = document.getElementById('titleInput');
const noteInput = document.getElementById('noteInput');
const recentFoldersSection = document.getElementById('recentFolders');
const myNotesSection = document.getElementById('myNotes');
const trashNotesSection = document.getElementById('trashNotes');
const archiveNotesSection = document.getElementById('archiveNotes');
const addNoteView = document.getElementById('addNoteView');
const dashboardView = document.getElementById('dashboardView');
const calendarView = document.getElementById('calendarView');
const trashView = document.getElementById('trashView');
const archiveView = document.getElementById('archiveView');
const calendarGrid = document.getElementById('calendarGrid');
const calendarMonth = document.getElementById('calendarMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const accountIcon = document.querySelector('.account-icon');
const accountMenu = document.getElementById('accountMenu');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const notesKey = 'noteCraftNotes';
const remindersKey = 'noteCraftReminders';

let notes = JSON.parse(localStorage.getItem(notesKey)) || [];
let reminders = JSON.parse(localStorage.getItem(remindersKey)) || [];

// ========== UI Navigation ==========
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    views.forEach(v => v.style.display = 'none');
    document.getElementById(item.dataset.target).style.display = 'block';
    if (item.dataset.target === 'dashboardView') renderDashboard();
    if (item.dataset.target === 'calendarView') renderCalendar();
    if (item.dataset.target === 'trashView') renderTrash();
    if (item.dataset.target === 'archiveView') renderArchive();
  });
});

addNewBtn.addEventListener('click', () => {
  views.forEach(v => v.style.display = 'none');
  addNoteView.style.display = 'block';
});

// ========== Account Menu Toggle ==========
accountIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  accountMenu.classList.toggle('show');
});

window.addEventListener('click', () => accountMenu.classList.remove('show'));
accountMenu.addEventListener('click', e => e.stopPropagation());

// ========== Save Note ==========
saveBtn.addEventListener('click', () => {
  const note = {
    id: Date.now(),
    folder: folderInput.value,
    title: titleInput.value,
    content: noteInput.value,
    date: new Date().toLocaleString(),
    archived: false,
    trashed: false
  };
  notes.push(note);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  folderInput.value = titleInput.value = noteInput.value = '';
  renderDashboard();
  dashboardView.style.display = 'block';
  addNoteView.style.display = 'none';
});

// ========== Render Dashboard ==========
function renderDashboard() {
  recentFoldersSection.innerHTML = '';
  myNotesSection.innerHTML = '';
  const activeNotes = notes.filter(n => !n.archived && !n.trashed);
  if (activeNotes.length === 0) {
    myNotesSection.innerHTML = '<p>No notes available</p>';
    return;
  }
  activeNotes.forEach(note => {
    const noteCard = createNoteCard(note, 'dashboard');
    myNotesSection.appendChild(noteCard);
  });
}

// ========== Render Trash ==========
function renderTrash() {
  trashNotesSection.innerHTML = '';
  const trashed = notes.filter(n => n.trashed);
  if (trashed.length === 0) {
    trashNotesSection.innerHTML = '<p>Nothing in Trash</p>';
    return;
  }
  trashed.forEach(note => {
    const card = createNoteCard(note, 'trash');
    trashNotesSection.appendChild(card);
  });
}

// ========== Render Archive ==========
function renderArchive() {
  archiveNotesSection.innerHTML = '';
  const archived = notes.filter(n => n.archived);
  if (archived.length === 0) {
    archiveNotesSection.innerHTML = '<p>Nothing in Archive</p>';
    return;
  }
  archived.forEach(note => {
    const card = createNoteCard(note, 'archive');
    archiveNotesSection.appendChild(card);
  });
}

// ========== Create Note Card ==========
function createNoteCard(note, context) {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.content}</p>
    <span>${note.date}</span>
    <div class="dot-menu">
      <button class="dots">⋮</button>
      <ul class="dot-options"></ul>
    </div>
  `;
  const menu = card.querySelector('.dot-options');

  if (context === 'dashboard') {
    menu.innerHTML = `
      <li onclick="moveToArchive(${note.id})">Move to Archive</li>
      <li onclick="moveToTrash(${note.id})">Move to Trash</li>
    `;
  } else if (context === 'trash') {
    menu.innerHTML = `
      <li onclick="restoreNote(${note.id})">Restore</li>
      <li onclick="deleteNote(${note.id})">Permanently Delete</li>
    `;
  } else if (context === 'archive') {
    menu.innerHTML = `<li onclick="unarchiveNote(${note.id})">Unarchive</li>`;
  }

  card.querySelector('.dots').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  });
  window.addEventListener('click', () => menu.classList.remove('show'));
  return card;
}

// ========== 3-Dot Actions ==========
function moveToTrash(id) {
  notes = notes.map(n => n.id === id ? { ...n, trashed: true } : n);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  renderDashboard();
}

function moveToArchive(id) {
  notes = notes.map(n => n.id === id ? { ...n, archived: true } : n);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  renderDashboard();
}

function restoreNote(id) {
  notes = notes.map(n => n.id === id ? { ...n, trashed: false } : n);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  renderTrash();
  renderDashboard();
}

function unarchiveNote(id) {
  notes = notes.map(n => n.id === id ? { ...n, archived: false } : n);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  renderArchive();
  renderDashboard();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem(notesKey, JSON.stringify(notes));
  renderTrash();
}

// ========== Calendar ==========
function renderCalendar() {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDay = new Date(currentYear, currentMonth, 1).getDay();

  calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  calendarGrid.innerHTML = '';

  dayNames.forEach(day => {
    const d = document.createElement('div');
    d.className = 'day-label';
    d.textContent = day;
    calendarGrid.appendChild(d);
  });

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    calendarGrid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';
    dayCell.textContent = d;

    const reminderList = reminders.filter(r => r.year === currentYear && r.month === currentMonth && r.day === d);
    if (reminderList.length) {
      const badge = document.createElement('span');
      badge.className = 'reminder-dot';
      dayCell.appendChild(badge);
    }

    dayCell.addEventListener('click', () => {
      const text = prompt(`Add reminder for ${d} ${monthNames[currentMonth]}`);
      if (text) {
        reminders.push({ id: Date.now(), text, year: currentYear, month: currentMonth, day: d });
        localStorage.setItem(remindersKey, JSON.stringify(reminders));
        renderCalendar();
      }
    });

    calendarGrid.appendChild(dayCell);
  }
}

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

// ========== Init ==========
renderDashboard();
