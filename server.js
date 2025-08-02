require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');

const app = express();
const port = process.env.PORT || 5000;

// === Session Configuration ===
app.use(session({
  secret: 'note-craft-secret-key', // Use a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use true in HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// === IBM App ID Passport Strategy ===
passport.use(new WebAppStrategy({
  clientId: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  oauthServerUrl: process.env.OAUTH_SERVER_URL,
  redirectUri: process.env.REDIRECT_URI
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// === Auth Middleware ===
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// === Auth Routes ===
app.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME));

app.get('/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
  failureRedirect: '/login-failed.html'
}), (req, res) => {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/logged-out.html');
  });
});

// === Notes APIs ===
const notesPath = path.join(__dirname, 'notes.json');

app.get('/api/notes', ensureAuthenticated, (req, res) => {
  const allNotes = fs.existsSync(notesPath) ? JSON.parse(fs.readFileSync(notesPath)) : {};
  const userNotes = allNotes[req.user.email] || [];
  const nonReminderNotes = userNotes.filter(note => !note.date);
  res.json(nonReminderNotes);
});

app.post('/api/notes', ensureAuthenticated, (req, res) => {
  const newNote = req.body;
  const allNotes = fs.existsSync(notesPath) ? JSON.parse(fs.readFileSync(notesPath)) : {};

  allNotes[req.user.email] = allNotes[req.user.email] || [];
  allNotes[req.user.email].push(newNote);

  fs.writeFileSync(notesPath, JSON.stringify(allNotes, null, 2));
  res.status(201).json({ message: 'Note saved successfully' });
});

app.put('/api/notes/:id', ensureAuthenticated, (req, res) => {
  const noteId = req.params.id;
  const updates = req.body;
  const allNotes = fs.existsSync(notesPath) ? JSON.parse(fs.readFileSync(notesPath)) : {};
  let userNotes = allNotes[req.user.email] || [];

  const index = userNotes.findIndex(note => note.id === noteId);
  if (index === -1) return res.status(404).json({ message: 'Note not found' });

  userNotes[index] = { ...userNotes[index], ...updates };
  allNotes[req.user.email] = userNotes;
  fs.writeFileSync(notesPath, JSON.stringify(allNotes, null, 2));

  res.json({ message: 'Note updated successfully' });
});

app.delete('/api/notes/:id', ensureAuthenticated, (req, res) => {
  const noteId = req.params.id;
  const allNotes = fs.existsSync(notesPath) ? JSON.parse(fs.readFileSync(notesPath)) : {};
  let userNotes = allNotes[req.user.email] || [];

  userNotes = userNotes.filter(note => note.id !== noteId);
  allNotes[req.user.email] = userNotes;
  fs.writeFileSync(notesPath, JSON.stringify(allNotes, null, 2));

  res.json({ message: 'Note permanently deleted' });
});

// === Reminders APIs ===
const remindersPath = path.join(__dirname, 'reminders.json');

app.get('/api/reminders', ensureAuthenticated, (req, res) => {
  const allReminders = fs.existsSync(remindersPath) ? JSON.parse(fs.readFileSync(remindersPath)) : {};
  const userReminders = allReminders[req.user.email] || [];
  res.json(userReminders);
});

app.post('/api/reminders', ensureAuthenticated, (req, res) => {
  const newReminder = req.body;
  const allReminders = fs.existsSync(remindersPath) ? JSON.parse(fs.readFileSync(remindersPath)) : {};

  allReminders[req.user.email] = allReminders[req.user.email] || [];
  allReminders[req.user.email].push(newReminder);

  fs.writeFileSync(remindersPath, JSON.stringify(allReminders, null, 2));
  res.status(201).json({ message: 'Reminder saved successfully' });
});

// === Start Server ===
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
