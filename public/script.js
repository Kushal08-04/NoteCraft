document.addEventListener('DOMContentLoaded', async () => {
  let notes = [], reminders = [], userEmail = null;

  const notesContainer = document.getElementById('notes-container');
  const calendarSection = document.getElementById('calendarSection');

  async function getUser() {
    const res = await fetch('/api/user');
    const data = await res.json();
    userEmail = data.email;
  }

  async function loadData() {
    try {
      notes = await (await fetch('/api/notes')).json();
      console.log('📥 Loaded notes:', notes); // ✅ ADD THIS

      reminders = await (await fetch('/api/reminders')).json();
      renderNotes('active');
      renderCalendar();
    } catch (err) {
      console.error('❌ Failed to load notes or reminders:', err);
    
  }


  function renderNotes(status = 'active') {
    if (!notesContainer) return;
    notesContainer.style.display = 'flex';
    calendarSection.classList.add('hidden');
    notesContainer.innerHTML = '';

    const filtered = notes.filter(n => n.status === status && (!n.date || status !== 'active'));
    console.log(`🧾 Rendering ${filtered.length} notes with status: ${status}`);

    if (filtered.length === 0) {
      notesContainer.innerHTML = '<p class="empty-msg">No notes to display.</p>';
      return;
    }

    filtered.forEach(n => {
      const card = document.createElement('div');
      card.className = `card ${n.color}`;
      card.innerHTML = `
        <div class="card-menu" onclick="showMenu(event,'${n.id}')">⋮</div>
        <div class="card-title">${n.title}</div>
        <p>${n.content}</p>
        <small>${n.date}</small>`;
      notesContainer.appendChild(card);
    });
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const today = new Date(), y = today.getFullYear(), m = today.getMonth();
    const days = new Date(y, m + 1, 0).getDate();

    for (let i = 1; i <= days; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cell.textContent = i;

      const hasReminder = reminders.some(r => r.date === dateStr);
      if (hasReminder) {
        const dot = document.createElement('div');
        dot.className = 'reminder-dot';
        cell.appendChild(dot);

        cell.addEventListener('click', () => {
          showReminderList(dateStr);
        });
      }

      grid.appendChild(cell);
    }
  }

  function showReminderList(date) {
    const list = reminders.filter(r => r.date === date && r.email === userEmail);
    notesContainer.innerHTML = '';
    notesContainer.style.display = 'flex';
    calendarSection.classList.remove('hidden');

    if (list.length === 0) {
      notesContainer.innerHTML = '<p class="empty-msg">No reminders for this date.</p>';
      return;
    }

    list.forEach(r => {
      const div = document.createElement('div');
      div.className = 'card yellow';
      div.innerHTML = `<div class="card-title">Reminder</div><p>${r.text}</p><small>${r.date}</small>`;
      notesContainer.appendChild(div);
    });
  }

  window.showMenu = (e, id) => {
    e.stopPropagation();
    document.querySelectorAll('.context-menu').forEach(m => m.remove());
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.innerHTML = `
      <button onclick="editNote('${id}')">Edit</button>
      <button onclick="archiveNote('${id}')">Archive</button>
      <button onclick="deleteNote('${id}')">Delete</button>`;
    document.body.appendChild(menu);
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    document.addEventListener('click', () => menu.remove(), { once: true });
  };

  window.editNote = async (id) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const newTitle = prompt('Edit title:', note.title);
    const newContent = prompt('Edit content:', note.content);
    if (newTitle !== null && newContent !== null) {
      note.title = newTitle;
      note.content = newContent;
      await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      renderNotes(note.status);
    }
  };

  async function archiveNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.status = 'archived';
    await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    renderNotes('active');
  }

  async function deleteNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    note.status = 'deleted';
    await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });
    renderNotes('active');
  }

  async function addReminder(date, text) {
    const reminder = {
      id: Date.now().toString(),
      date,
      text,
      email: userEmail
    };
    reminders.push(reminder);
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminder)
    });
    renderCalendar();
  }

  async function addNote(title, content) {
  const note = {
    id: Date.now().toString(),
    title,
    content,
    date: '', // no reminder unless explicitly set
    color: ['yellow', 'red', 'blue', 'purple'][Math.floor(Math.random() * 4)],
    status: 'active',
    email: userEmail
  };
  notes.push(note);

  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    });

    const data = await res.json();
    console.log('✅ Note saved:', data); // ✅ ADD THIS

    renderNotes('active'); // refresh UI
  } catch (err) {
    console.error('❌ Failed to save note:', err);
  }
}


  document.getElementById('noteForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const date = document.getElementById('reminderDate').value;
    if (title && content) {
      await addNote(title, content);
      if (date) await addReminder(date, title);
      e.target.reset();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/logout'; // You may change to '/loggedout.html' if custom
  });

  // Sidebar navigation
  document.getElementById('allNotesBtn').addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('allNotesBtn').classList.add('active');

    renderNotes('active');
  });

  document.getElementById('archiveBtn').addEventListener('click', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('archiveBtn').classList.add('active'); // ✅ correct
  renderNotes('archived');
});



  document.getElementById('trashBtn').addEventListener('click', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('trashBtn').classList.add('active');
  renderNotes('deleted');
});

document.getElementById('calendarBtn').addEventListener('click', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('calendarBtn').classList.add('active');
  calendarSection.classList.remove('hidden');
  notesContainer.style.display = 'none';
});


  await getUser();
  await loadData();
});
