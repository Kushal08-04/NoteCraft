// --- Toggle Add New Form ---
document.getElementById('add-new-btn').addEventListener('click', () => {
  document.getElementById('add-new-form').classList.toggle('hidden');
});

// --- Toggle Account Menu ---
const accountIcon = document.getElementById('account-icon');
const accountMenu = document.getElementById('account-menu');

accountIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  accountMenu.style.display = accountMenu.style.display === 'flex' ? 'none' : 'flex';
});

document.addEventListener('click', (e) => {
  if (!accountMenu.contains(e.target) && e.target !== accountIcon) {
    accountMenu.style.display = 'none';
  }
});

// --- Save Note ---
let notes = JSON.parse(localStorage.getItem('notes')) || [];

document.getElementById('save-note-btn').addEventListener('click', () => {
  const title = document.getElementById('note-title').value.trim();
  const folder = document.getElementById('note-folder').value.trim();
  const content = document.getElementById('note-content').value.trim();

  if (!title || !content) return alert("Title and content are required.");

  const note = {
    id: Date.now(),
    title,
    folder,
    content,
    date: new Date().toLocaleString()
  };

  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
  renderFolders();
  document.getElementById('note-title').value = '';
  document.getElementById('note-folder').value = '';
  document.getElementById('note-content').value = '';
});

// --- Render Notes ---
function renderNotes() {
  const container = document.getElementById('note-container');
  container.innerHTML = '';
  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div class="card-options">⋮</div>
      <div class="options-menu">
        <button onclick="deleteNote(${note.id})">Move to Trash</button>
        <button onclick="archiveNote(${note.id})">Archive</button>
      </div>
      <h4>${note.title}</h4>
      <p>${note.content}</p>
      <small>${note.date}</small>
    `;
    addMenuBehavior(card);
    container.appendChild(card);
  });
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

function archiveNote(id) {
  alert("Archive feature is pending.");
}

// --- Render Folders ---
function renderFolders() {
  const container = document.getElementById('folder-container');
  container.innerHTML = '';
  const folders = {};

  notes.forEach(note => {
    if (note.folder) {
      if (!folders[note.folder]) folders[note.folder] = [];
      folders[note.folder].push(note);
    }
  });

  Object.keys(folders).forEach(folder => {
    const card = document.createElement('div');
    card.className = 'folder-card';
    card.innerHTML = `
      <div class="card-options">⋮</div>
      <div class="options-menu">
        <button onclick="moveFolderToTrash('${folder}')">Move to Trash</button>
        <button onclick="archiveFolder('${folder}')">Archive</button>
      </div>
      <h4>${folder}</h4>
      <p>${folders[folder].length} notes</p>
    `;
    addMenuBehavior(card);
    container.appendChild(card);
  });
}

function moveFolderToTrash(folder) {
  notes = notes.filter(n => n.folder !== folder);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderFolders();
  renderNotes();
}

function archiveFolder(folder) {
  alert("Archive feature is pending.");
}

// --- Menu Behavior ---
function addMenuBehavior(card) {
  const btn = card.querySelector('.card-options');
  const menu = card.querySelector('.options-menu');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.style.display = 'none';
    }
  });
}

// --- Calendar ---
const calendarGrid = document.getElementById('calendar-grid');
const monthDisplay = document.getElementById('calendar-month');
let currentMonth = new Date();

function renderCalendar() {
  calendarGrid.innerHTML = '';
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  monthDisplay.textContent = `${currentMonth.toLocaleString('default', { month: 'long' })} ${year}`;

  const days = [];

  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevDays - i, other: true });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, other: false });
  }

  // Fill rest
  while (days.length % 7 !== 0) {
    days.push({ day: days.length, other: true });
  }

  days.forEach((obj, i) => {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    if (obj.other) div.classList.add('other-month');

    const dateKey = `${year}-${month}-${obj.day}`;
    const reminder = localStorage.getItem(`reminder-${dateKey}`);
    div.innerHTML = `<strong>${obj.day}</strong>${reminder ? `<p>${reminder}</p>` : ''}`;

    div.addEventListener('click', () => {
      if (!obj.other) {
        document.getElementById('reminder-form').classList.remove('hidden');
        document.getElementById('reminder-text').dataset.date = dateKey;
        document.getElementById('reminder-text').value = reminder || '';
      }
    });

    calendarGrid.appendChild(div);
  });
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
});

document.getElementById('save-reminder').addEventListener('click', () => {
  const input = document.getElementById('reminder-text');
  const dateKey = input.dataset.date;
  localStorage.setItem(`reminder-${dateKey}`, input.value.trim());
  input.value = '';
  document.getElementById('reminder-form').classList.add('hidden');
  renderCalendar();
});

// Initial load
renderNotes();
renderFolders();
renderCalendar();
