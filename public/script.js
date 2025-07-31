const form = document.getElementById("noteForm");
const notesContainer = document.getElementById("notesContainer");
const recentFolders = document.getElementById("recentFolders");
const searchInput = document.getElementById("search");

const pastelColors = ["#fde2e2", "#e0f7fa", "#fff9c4", "#e1bee7", "#f3e5f5", "#dcedc8", "#c8e6c9"];
let allNotes = []; // hold notes for searching

function getRandomColor() {
  return pastelColors[Math.floor(Math.random() * pastelColors.length)];
}

function renderNotes(notes) {
  notesContainer.innerHTML = "";
  notes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.style.setProperty("--bg-color", getRandomColor());
    card.innerHTML = `
      <h4>${note.title}</h4>
      <p>${note.content.substring(0, 80)}...</p>
      <small>${note.date}</small>
    `;
    notesContainer.appendChild(card);
  });
}

function renderFolders(folders) {
  recentFolders.innerHTML = "";
  folders.forEach(name => {
    const card = document.createElement("div");
    card.className = "folder-card";
    card.style.setProperty("--bg-color", getRandomColor());
    card.innerHTML = `<h4>${name}</h4>`;
    recentFolders.appendChild(card);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const folder = document.getElementById("folder").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) return alert("Please enter both title and content");

  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, folder }),
  });

  const data = await res.json();
  if (data.success) {
    form.reset();
    loadNotes(); // reload UI
    showSection("notes");
  }
});

async function loadNotes() {
  const res = await fetch("/api/notes");
  const data = await res.json();

  allNotes = data.notes;
  renderNotes(allNotes);
  renderFolders(data.recentFolders);
}

// 🔍 SEARCH FUNCTION
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allNotes.filter(note =>
    note.title.toLowerCase().includes(query) ||
    note.content.toLowerCase().includes(query)
  );
  renderNotes(filtered);
});

// 🧭 NAVIGATION BETWEEN SECTIONS
function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

window.onload = () => {
  showSection("notes");
  loadNotes();
};
