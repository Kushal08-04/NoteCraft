document.addEventListener('DOMContentLoaded', async function () {
  let notes = [];
  let reminders = [];
  let userEmail = null;

  // Get user from IBM App ID
  async function getUser() {
    const res = await fetch('/api/user');
    const data = await res.json();
    userEmail = data.email;
  }

  // Load all data from server
  async function loadData() {
    const notesRes = await fetch('/api/notes');
    notes = await notesRes.json();

    const remindersRes = await fetch('/api/reminders');
    reminders = await remindersRes.json();

    renderNotes('active'); // Default view
    renderCalendar();
  }

  // Render Notes by status
  function renderNotes(status = 'active') {
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';
    const filteredNotes = notes.filter(n => n.status === status);

    filteredNotes.forEach(note => {
      const card = document.createElement('div');
      card.className = `card ${note.color}`;
      card.innerHTML = `
        <div class="card-menu" onclick="showMenu(event, '${note.id}')">⋮</div>
        <div class="card-title">${note.title}</div>
        <p>${note.content}</p>
        <small>${note.date}</small>
      `;
      notesContainer.appendChild(card);
    });
  }

  // Render Calendar view with reminders
  function renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.innerText = d;

      const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasReminder = reminders.some(r => r.date === dayString);

      if (hasReminder) {
        const dot = document.createElement('div');
        dot.className = 'reminder-dot';
        cell.appendChild(dot);
      }

      calendarGrid.appendChild(cell);
    }
  }

  // Context Menu for Edit / Archive / Delete
  window.showMenu = function (e, noteId) {
    e.stopPropagation();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button onclick="editNote('${noteId}')">Edit</button>
      <button onclick="archiveNote('${noteId}')">Archive</button>
      <button onclick="deleteNote('${noteId}')">Delete</button>
    `;
    document.body.appendChild(menu);
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;

    document.addEventListener('click', () => menu.remove(), { once: true });
  };

  // Add Note
  async function addNote(title, content, color = 'yellow') {
    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toLocaleDateString(),
      color,
      status: 'active',
      email: userEmail
    };

    notes.push(newNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes('active');

    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    });
  }

  // Archive Note
  async function archiveNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
      note.status = 'archived';
      renderNotes('active');
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
    }
  }

  // Delete Note
  async function deleteNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
      note.status = 'deleted';
      renderNotes('active');
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
    }
  }

  // Edit Note
  window.editNote = function (id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const newTitle = prompt('Edit title:', note.title);
    const newContent = prompt('Edit content:', note.content);
    if (newTitle !== null && newContent !== null) {
      note.title = newTitle;
      note.content = newContent;
      renderNotes(note.status);

      fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
    }
  };

  // Add Reminder
  async function addReminder(date, text) {
    const reminder = {
      id: Date.now().toString(),
      date,
      text,
      email: userEmail
    };
    reminders.push(reminder);
    renderCalendar();

    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder)
    });
  }

  // Sidebar Button Navigation
  document.getElementById('allNotesBtn').addEventListener('click', () => {
    renderNotes('active');
    document.getElementById('calendar-grid').style.display = 'none';
    document.getElementById('notes-container').style.display = 'flex';
  });

  document.getElementById('archiveBtn').addEventListener('click', () => {
    renderNotes('archived');
    document.getElementById('calendar-grid').style.display = 'none';
    document.getElementById('notes-container').style.display = 'flex';
  });

  document.getElementById('trashBtn').addEventListener('click', () => {
    renderNotes('deleted');
    document.getElementById('calendar-grid').style.display = 'none';
