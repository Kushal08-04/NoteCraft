document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".section");
  const navItems = document.querySelectorAll(".nav li");
  const userIcon = document.getElementById("userIcon");
  const userMenu = document.getElementById("userMenu");

  const folderContainer = document.getElementById("folderContainer");
  const noteContainer = document.getElementById("noteContainer");

  const archiveContainer = document.getElementById("archiveContainer");
  const trashContainer = document.getElementById("trashContainer");

  const randomColors = ["#e3f2fd", "#ffe0b2", "#f8bbd0", "#dcedc8", "#d1c4e9"];

  function showSection(sectionId) {
    sections.forEach(sec => sec.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");

    navItems.forEach(item => item.classList.remove("active"));
    document.querySelector(`.nav li[data-section="${sectionId}"]`)?.classList.add("active");
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      showSection(item.dataset.section);
    });
  });

  userIcon.addEventListener("click", () => {
    userMenu.classList.toggle("hidden");
  });

  window.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.classList.add("hidden");
    }
  });

  function loadFromStorage() {
    return JSON.parse(localStorage.getItem("notesData") || "[]");
  }

  function saveToStorage(data) {
    localStorage.setItem("notesData", JSON.stringify(data));
  }

  function render() {
    const notes = loadFromStorage();

    folderContainer.innerHTML = "";
    noteContainer.innerHTML = "";
    archiveContainer.innerHTML = "";
    trashContainer.innerHTML = "";

    notes.forEach(note => {
      const card = document.createElement("div");
      card.className = note.type === "folder" ? "folder-card" : "note-card";
      card.style.background = randomColors[Math.floor(Math.random() * randomColors.length)];
      card.innerHTML = `
        <strong>${note.title}</strong><br/>
        <small>${note.folder}</small><br/>
        <p>${note.content}</p>
        <div class="menu">⋮</div>
      `;

      const menu = document.createElement("div");
      menu.className = "menu-options hidden";

      const restoreBtn = document.createElement("button");
      restoreBtn.textContent = "Restore";
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      const archiveBtn = document.createElement("button");
      archiveBtn.textContent = "Archive";

      card.querySelector(".menu").addEventListener("click", () => {
        menu.classList.toggle("hidden");
      });

      if (note.status === "active") {
        menu.appendChild(deleteBtn);
        menu.appendChild(archiveBtn);
      } else if (note.status === "trash") {
        menu.appendChild(restoreBtn);
      }

      card.appendChild(menu);

      if (note.status === "active") {
        if (note.type === "folder") folderContainer.appendChild(card);
        else noteContainer.appendChild(card);
      } else if (note.status === "archive") {
        archiveContainer.appendChild(card);
      } else if (note.status === "trash") {
        trashContainer.appendChild(card);
      }

      deleteBtn.onclick = () => {
        note.status = "trash";
        saveToStorage(notes);
        render();
      };

      archiveBtn.onclick = () => {
        note.status = "archive";
        saveToStorage(notes);
        render();
      };

      restoreBtn.onclick = () => {
        note.status = "active";
        saveToStorage(notes);
        render();
      };
    });
  }

  document.getElementById("saveNote").addEventListener("click", () => {
    const title = document.getElementById("noteTitle").value;
    const folder = document.getElementById("noteFolder").value;
    const content = document.getElementById("noteContent").value;

    if (!title || !content) return alert("Title and content required");

    const notes = loadFromStorage();

    notes.push({
      id: Date.now(),
      title,
      folder,
      content,
      status: "active",
      type: "note"
    });

    saveToStorage(notes);
    render();
    showSection("dashboard");
  });

  render();
});
