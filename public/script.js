document.addEventListener('DOMContentLoaded', async () => {
  let notes = [], reminders = [], userEmail = null;

  async function getUser() {
    const r = await fetch('/api/user');
    const d = await r.json();
    userEmail = d.email;
  }
  async function loadData() {
    notes = await (await fetch('/api/notes')).json();
    reminders = await (await fetch('/api/reminders')).json();
    renderNotes('active');
    renderCalendar();
  }

  function renderNotes(status = 'active') {
    const cont = document.getElementById('notes-container');
    cont.style.display = 'flex';
    cont.innerHTML = '';
    notes.filter(n => n.status === status).forEach(n => {
      const c = document.createElement('div');
      c.className = `card ${n.color}`;
      c.innerHTML = `
        <div class="card-menu" onclick="showMenu(event,'${n.id}')">⋮</div>
        <div class="card-title">${n.title}</div>
        <p>${n.content}</p><small>${n.date}</small>`;
      cont.appendChild(c);
    });
  }

  function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const d = new Date(), y = d.getFullYear(), m = d.getMonth(),
          days = new Date(y, m+1, 0).getDate();
    for (let i = 1; i <= days; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.textContent = i;
      const str = `${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      if (reminders.some(r => r.date === str)) {
        const dot = document.createElement('div');
        dot.className = 'reminder-dot';
        cell.appendChild(dot);
      }
      grid.appendChild(cell);
    }
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
    const n = notes.find(x => x.id === id);
    if (!n) return;
    const t = prompt('Edit title:', n.title);
    const c = prompt('Edit content:', n.content);
    if (t !== null && c !== null) {
      n.title = t; n.content = c;
      await fetch(`/api/notes/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(n)
      });
      renderNotes(n.status);
    }
  };

  async function addReminder(date, text) {
    const r = { id: Date.now().toString(), date, text, email: userEmail };
    reminders.push(r);
    await fetch('/api/reminders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r)
    });
    renderCalendar();
  }

  async function addNote(title, content) {
    const note = {
      id: Date.now().toString(), title, content,
      date: new Date().toLocaleDateString(),
      color: ['yellow','red','blue','purple'][Math.floor(Math.random()*4)],
      status: 'active', email: userEmail
    };
    notes.push(note);
    await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note)
    });
    renderNotes('active');
  }

  async function archiveNote(id) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    n.status = 'archived';
    await fetch(`/api/notes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(n)
    });
    renderNotes('active');
  }

  async function deleteNote(id) {
    const n = notes.find(x => x.id === id);
    if (!n) return;
    n.status = 'deleted';
    await fetch(`/api/notes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(n)
    });
    renderNotes('active');
  }

  // Navigation & form + logout
  document.getElementById('noteForm').addEventListener('submit', async e => {
    e.preventDefault();
    const t = document.getElementById('noteTitle').value.trim();
    const c = document.getElementById('noteContent').value.trim();
    const d = document.getElementById('reminderDate').value;
    if (t && c) {
      await addNote(t, c);
      if (d) await addReminder(d, t);
      e.target.reset();
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = '/logout';
  });

  document.getElementById('allNotesBtn').addEventListener('click', () => {
    renderNotes('active');
    document.getElementById('calendarSection').classList.add('hidden');
  });
  document.getElementById('archiveBtn').addEventListener('click', () => {
    renderNotes('archived');
    document.getElementById('calendarSection').classList.add('hidden');
  });
  document.getElementById('trashBtn').addEventListener('click', () => {
    renderNotes('deleted');
    document.getElementById('calendarSection').classList.add('hidden');
  });
  document.getElementById('calendarBtn').addEventListener('click', () => {
    renderCalendar();
    document.getElementById('calendarSection').classList.remove('hidden');
    document.getElementById('notes-container').style.display = 'none';
  });

  await getUser();
  await loadData();
});
