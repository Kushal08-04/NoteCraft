const views = {
  dashboard: document.getElementById('dashboard-view'),
  add: document.getElementById('add-section'),
  calendar: document.getElementById('calendar-view'),
  archive: document.getElementById('archive-view'),
  trash: document.getElementById('trash-view')
};

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(views).forEach(view => view.classList.add('hidden'));
    views[btn.dataset.view].classList.remove('hidden');
    if (btn.dataset.view === 'calendar') renderCalendar();
    if (btn.dataset.view === 'dashboard') renderNotes();
    if (btn.dataset.view === 'trash') renderTrash();
    if (btn.dataset.view === 'archive') renderArchive();
  });
});

const saveBtn = document.getElementById('save-btn');
saveBtn.addEventListener('click', () => {
  const title = document.getElementById('note-title').value;
  const folder = document.getElementById('note-folder').value;
  const content = document.getElementById('note-content').value;
  if (!title || !folder || !content) return alert("All fields required.");
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.push({ title, folder, content, archived: false, trashed: false });
  localStorage.setItem('notes', JSON.stringify(notes));
  document.getElementById('note-title').value = '';
  document.getElementById('note-folder').value = '';
  document.getElementById('note-content').value = '';
  renderNotes();
});

function renderNotes() {
  const container = document.getElementById('notes-container');
  const folderBox = document.getElementById('folders-container');
  container.innerHTML = '';
  folderBox.innerHTML = '';
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const folders = {};
  notes.filter(n => !n.archived && !n.trashed).forEach(note => {
    if (!folders[note.folder]) folders[note.folder] = [];
    folders[note.folder].push(note);
  });

  Object.entries(folders).forEach(([folderName, notesList]) => {
    const folderCard = document.createElement('div');
    folderCard.className = 'folder-card';
    folderCard.innerHTML = `<strong>${folderName}</strong><br>${notesList.length} notes
    <div class="dots">⋮<div class="menu">
    <button onclick="moveToArchive('${folderName}')">Archive</button>
    <button onclick="moveToTrash('${folderName}')">Trash</button></div></div>`;
    folderBox.appendChild(folderCard);
    const dots = folderCard.querySelector('.dots');
    dots.addEventListener('click', () => {
      const menu = dots.querySelector('.menu');
      menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
    });
  });
}

function moveToTrash(folder) {
  let notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.forEach(n => {
    if (n.folder === folder) n.trashed = true;
  });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

function moveToArchive(folder) {
  let notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.forEach(n => {
    if (n.folder === folder) n.archived = true;
  });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
}

function renderTrash() {
  const trash = document.getElementById('trash-container');
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const trashed = notes.filter(n => n.trashed);
  if (!trashed.length) return trash.innerHTML = 'Nothing in Trash';
  trash.innerHTML = '';
  trashed.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.innerHTML = `<strong>${note.title}</strong><br>${note.folder}
    <div class="dots">⋮<div class="menu">
    <button onclick="restoreNote('${note.title}')">Restore</button>
    <button onclick="deletePermanently('${note.title}')">Delete</button>
    </div></div>`;
    trash.appendChild(div);
  });
}

function renderArchive() {
  const archive = document.getElementById('archive-container');
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const archived = notes.filter(n => n.archived);
  if (!archived.length) return archive.innerHTML = 'Nothing in Archive';
  archive.innerHTML = '';
  archived.forEach(note => {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.innerHTML = `<strong>${note.title}</strong><br>${note.folder}
    <div class="dots">⋮<div class="menu">
    <button onclick="unarchiveNote('${note.title}')">Unarchive</button>
    </div></div>`;
    archive.appendChild(div);
  });
}

function restoreNote(title) {
  let notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.forEach(n => {
    if (n.title === title) n.trashed = false;
  });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderTrash();
  renderNotes();
}

function unarchiveNote(title) {
  let notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.forEach(n => {
    if (n.title === title) n.archived = false;
  });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderArchive();
  renderNotes();
}

function deletePermanently(title) {
  let notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes = notes.filter(n => n.title !== title);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderTrash();
}

let currentDate = new Date();
function renderCalendar() {
  const calendar = document.getElementById('calendar-days');
  const monthYear = document.getElementById('month-year');
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthYear.textContent = `${monthNames[month]} ${year}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  calendar.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.textContent = day;
    div.addEventListener('click', () => showReminders(`${year}-${month+1}-${day}`));
    calendar.appendChild(div);
  }
}

document.getElementById('prev-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

function showReminders(date) {
  document.getElementById('selected-date').textContent = date;
  const reminders = JSON.parse(localStorage.getItem('reminders') || '{}');
  const list = document.getElementById('reminder-list');
  list.innerHTML = '';
  (reminders[date] || []).forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    list.appendChild(li);
  });

  document.getElementById('add-reminder').onclick = () => {
    const text = document.getElementById('reminder-input').value;
    if (!text) return;
    if (!reminders[date]) reminders[date] = [];
    reminders[date].push(text);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    showReminders(date);
    document.getElementById('reminder-input').value = '';
  };
}

document.getElementById('account-icon').addEventListener('click', () => {
  const menu = document.getElementById('account-menu');
  menu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#account-icon') && !e.target.closest('#account-menu')) {
    document.getElementById('account-menu').classList.add('hidden');
  }
});

renderNotes();
