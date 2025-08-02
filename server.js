require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { WebAppStrategy } = require('ibmcloud-appid');

const app = express();
const port = process.env.PORT || 5000;

// Session middleware
app.use(session({
  secret: 'note-craft-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// IBM App ID Setup
passport.use(new WebAppStrategy({
  clientId: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  oauthServerUrl: process.env.OAUTH_SERVER_URL,
  redirectUri: process.env.REDIRECT_URI
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth Routes
app.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME));
app.get('/callback',
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, { failureRedirect: '/login-failed.html' }),
  (req, res) => res.redirect('/')
);
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/logged-out.html');
  });
});

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

// === Notes APIs ===
app.get('/api/notes', isAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  const file = path.join(__dirname, 'notes.json');
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');

  const allNotes = JSON.parse(fs.readFileSync(file));
  const notes = (allNotes[userEmail] || []).filter(n => !n.date);
  res.json(notes);
});

app.post('/api/notes', isAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  const newNote = req.body;
  const file = path.join(__dirname, 'notes.json');

  const allNotes = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  allNotes[userEmail] = allNotes[userEmail] || [];
  allNotes[userEmail].push(newNote);

  fs.writeFileSync(file, JSON.stringify(allNotes, null, 2));
  res.status(201).json({ message: 'Note saved' });
});

app.put('/api/notes/:id', isAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  const noteId = req.params.id;
  const updatedFields = req.body;

  const file = path.join(__dirname, 'notes.json');
  const allNotes = JSON.parse(fs.readFileSync(file));
  const notes = allNotes[userEmail] || [];

  const index = notes.findIndex(n => n.id === noteId);
  if (index === -1) return res.status(404).json({ message: 'Note not found' });

  notes[index] = { ...notes[index], ...updatedFields };
  allNotes[userEmail] = notes;
  fs.writeFileSync(file, JSON.stringify(allNotes, null, 2));

  res.json({ message: 'Note updated' });
});

app.delete('/api/notes/:id', isAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  const noteId = req.params.id;

  const file = path.join(__dirname, 'notes.json');
  const allNotes = JSON.parse(fs.readFileSync(file));
  const notes = allNotes[userEmail] || [];

  allNotes[userEmail] = notes.filter(n => n.id !== noteId);
  fs.writeFileSync(file, JSON.stringify(allNotes, null, 2));

  res.json({ message: 'Note deleted' });
});

// === Reminders APIs ===
app.get('/api/reminders', isAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  const file = path.join(__dirname, 'reminders.json');
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');

  const allReminders = JSON.parse(fs.readFileSync(file));
  res.json(allReminders[userEmail] || []);
});

app.post('/api/reminders', isAuthenticated, (req, res) => {
  const userEmail = req.user.email;
  const reminder = req.body;

  const file = path.join(__dirname, 'reminders.json');
  const allReminders = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  allReminders[userEmail] = allReminders[userEmail] || [];
  allReminders[userEmail].push(reminder);

  fs.writeFileSync(file, JSON.stringify(allReminders, null, 2));
  res.status(201).json({ message: 'Reminder saved' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ NOTE CRAFT server running at http://localhost:${port}`);
});
