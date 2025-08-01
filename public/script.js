const noteTitle = document.getElementById('noteTitle');
const noteFolder = document.getElementById('noteFolder');
const noteContent = document.getElementById('noteContent');
const saveBtn = document.getElementById('saveBtn');
const notesContainer = document.getElementById('notesContainer');
const foldersContainer = document.getElementById('foldersContainer');
const calendarBtn = document.getElementById('calendarBtn');

const pastelColors = ['#cce5ff', '#f8d7da', '#d4edda', '#fff3cd', '#e2e3e5', '#fefefe'];

function createCard(title, content, container) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.style.setProperty('--pastel', pastelColors[Math.floor(Math.random() * pastelColors.length)]);
  card.innerHTML = `
    <strong>${title}</strong>
    <p>${content}</p>
    <small>${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}</small>
  `;
  container.prepend(card);
}

saveBtn.addEventListener('click', () => {
  const title = noteTitle.value.trim();
  const folder = noteFolder.value.trim();
  const content = noteContent.value.trim();
  if (!title || !folder || !content) return alert("All fields are required!");
  createCard(folder, "", foldersContainer);
  createCard(title, content, notesContainer);
  noteTitle.value = '';
  noteFolder.value = '';
  noteContent.value = '';
});

calendarBtn.addEventListener('click', () => {
  document.getElementById('calendarModal').classList.remove('hidden');
});

function closeCalendar() {
  document.getElementById('calendarModal').classList.add('hidden');
}
