const sections = document.querySelectorAll('.section');
function showSection(id) {
  sections.forEach(section => {
    section.style.display = section.id === id ? 'block' : 'none';
  });
}

document.getElementById('noteForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const folder = document.getElementById('folder').value || 'General';
  const content = document.getElementById('content').value;

  const noteCard = document.createElement('div');
  noteCard.className = 'card';
  noteCard.style.backgroundColor = getRandomPastel();

  noteCard.innerHTML = `
    <div class="title">${title}</div>
    <div class="content">${content}</div>
    <div class="date">${new Date().toLocaleString()}</div>
  `;

  document.getElementById('notesContainer').appendChild(noteCard);
  e.target.reset();
});

function getRandomPastel() {
  const colors = ['#fde2e4', '#cfe0e8', '#e2f0cb', '#fef6e4', '#e3d5ca', '#d8e2dc'];
  return colors[Math.floor(Math.random() * colors.length)];
}

document.getElementById('profileUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('profilePic').src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// Placeholder for auth
document.getElementById('loginBtn').onclick = () => {
  document.getElementById('loginBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline';
  document.getElementById('userName').textContent = 'Welcome!';
};

document.getElementById('logoutBtn').onclick = () => {
  document.getElementById('loginBtn').style.display = 'inline';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('userName').textContent = '';
};
