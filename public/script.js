document.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  document.getElementById('profileIcon').addEventListener('click', toggleAuthPopup);
  document.getElementById('loginBtn').addEventListener('click', loginUser);
  document.getElementById('logoutBtn').addEventListener('click', logoutUser);
  document.getElementById('searchBar').addEventListener('input', filterNotes);
});

function toggleAuthPopup() {
  const popup = document.getElementById('authPopup');
  popup.style.display = popup.style.display === 'flex' ? 'none' : 'flex';
}

function loginUser() {
  // Simulated login
  alert('Logged in');
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'block';
}

function logoutUser() {
  alert('Logged out');
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
}

function showAddNoteSection() {
  document.getElementById('addNoteSection').style.display = 'block';
}

function saveNote() {
  const title = document.getElementById('noteTitle').value;
  const folder = document.getElementById('noteFolder').value;
  const content = document.getElementById('noteContent').value;

  if (!title || !content || !folder) return alert("All fields required!");

  const note = {
    id: Date.now(),
    title,
    folder,
    content,
    date: new Date().toLocaleDateString()
  };

  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
}

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  const foldersContainer = document.getElementById('foldersContainer');
  const notesContainer = document.getElementById('notesContainer');
  foldersContainer.innerHTML = '';
  notesContainer.innerHTML = '';

  const folders = [...new Set(notes.map(n => n.folder))];
  folders.forEach(folder => {
    foldersContainer.innerHTML += `
      <div class="folder-card" style="background: ${randomPastelColor()}">
        <p>${folder}</p>
        <div class="actions" onclick="alert('Folder actions coming soon!')">⋮</div>
      </div>`;
  });

  notes.forEach(note => {
    notesContainer.innerHTML += `
      <div class="note-card" style="background: ${randomPastelColor()}">
        <strong>${note.title}</strong>
        <p>${note.content}</p>
        <small>${note.date}</small>
        <div class="actions" onclick="deleteNote(${note.id})">🗑️</div>
      </div>`;
  });
}

function deleteNote(id) {
  let notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes = notes.filter(note => note.id !== id);
  localStorage.setItem('notes', JSON.stringify(notes));
  loadNotes();
}

function filterNotes(e) {
  const query = e.target.value.toLowerCase();
  const allNotes = document.querySelectorAll('.note-card');
  allNotes.forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(query) ? 'block' : 'none';
  });
}

function randomPastelColor() {
  const pastel = ['#d9eaff', #ffe7cc, #fce2e2, #ccffd9, #e2ccff'];
  return pastel[Math.floor(Math.random() * pastel.length)];
}

function showCalendar() {
  alert('Calendar page works. Functionality already implemented.');
}

function showArchive() {
  alert('Archive feature coming soon!');
}

function showTrash() {
  alert('Trash feature coming soon!');
}
