const addNewBtn = document.getElementById('addNewBtn');
const addNoteSection = document.getElementById('addNoteSection');
const noteContainer = document.getElementById('noteContainer');
const folderContainer = document.getElementById('folderContainer');
const searchBar = document.getElementById('searchBar');
const accountMenu = document.getElementById('accountMenu');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentView = 'home';

addNewBtn.onclick = () => {
  addNoteSection.classList.toggle('hidden');
};

function saveNote() {
  const title = document.getElementById('noteTitle').value;
  const folder = document.getElementById('noteFolder').value;
  const content = document.getElementById('noteContent').value;

  if (!title || !content) return alert("Fill in title and note");

  const note = {
    id: Date.now(),
    title,
    folder,
    content,
    date: new Date().toLocaleString(),
    archived: false,
    trashed: false
  };

  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
  addNoteSection.classList.add('hidden');
}

function renderNotes() {
  noteContainer.innerHTML = '';
  folderContainer.innerHTML = '';

  const filteredNotes = notes.filter(n => !n.archived && !n.trashed);
  const folders = [...new Set(filteredNotes.map(n => n.folder))];

  folders.forEach(folder => {
    const card = document.createElement('div');
    card.className = 'folder-card';
    card.style.backgroundColor = getRandomColor();
    card.textContent = folder || 'Untitled Folder';
    folderContainer.appendChild(card);
  });

  filteredNotes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.backgroundColor = getRandomColor();
    card.innerHTML = `
      <div class="actions">
        <button onclick="archiveNote(${note.id})">📦</button>
        <button onclick="trashNote(${note.id})">🗑️</button>
      </div>
      <h4>${note.title}</h4>
      <p>${note.content}</p>
      <small>${note.date}</small>
    `;
    noteContainer.appendChild(card);
  });
}

function getRandomColor() {
  const colors = ['#dbeafe', '#fee2e2', '#fef9c3', '#e0f2fe', '#ede9fe', '#dcfce7'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function archiveNote(id) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note.archived = true;
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
  }
}

function trashNote(id) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note.trashed = true;
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes();
  }
}

function showArchive() {
  currentView = 'archive';
  renderFiltered(n => n.archived);
}

function showTrash() {
  currentView = 'trash';
  renderFiltered(n => n.trashed);
}

function showCalendar() {
  currentView = 'calendar';
  noteContainer.innerHTML = '<p class="default-message">📅 Calendar View (Coming Soon)</p>';
  folderContainer.innerHTML = '';
}

function renderFiltered(filterFn) {
  noteContainer.innerHTML = '';
  folderContainer.innerHTML = '';
  const filtered = notes.filter(filterFn);
  if (filtered.length === 0) {
    noteContainer.innerHTML = `<p class="default-message">Nothing in ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}</p>`;
  } else {
    filtered.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.style.backgroundColor = getRandomColor();
      card.innerHTML = `
        <h4>${note.title}</h4>
        <p>${note.content}</p>
        <small>${note.date}</small>
      `;
      noteContainer.appendChild(card);
    });
  }
}

function toggleAccountMenu() {
  accountMenu.classList.toggle('hidden');
}

loginBtn.onclick = () => {
  loginBtn.classList.add('hidden');
  logoutBtn.classList.remove('hidden');
};

logoutBtn.onclick = () => {
  logoutBtn.classList.add('hidden');
  loginBtn.classList.remove('hidden');
};

searchBar.addEventListener('input', () => {
  const query = searchBar.value.toLowerCase();
  const filtered = notes.filter(n => 
    !n.archived && !n.trashed && 
    (n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
  );
  noteContainer.innerHTML = '';
  folderContainer.innerHTML = '';
  filtered.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.style.backgroundColor = getRandomColor();
    card.innerHTML = `
      <h4>${note.title}</h4>
      <p>${note.content}</p>
      <small>${note.date}</small>
    `;
    noteContainer.appendChild(card);
  });
});

renderNotes();
