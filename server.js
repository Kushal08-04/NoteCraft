/*require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const appID = require('ibmcloud-appid');
const WebAppStrategy = appID.WebAppStrategy;

const app = express();
const port = process.env.PORT || 5000;

app.use(session({
  secret: 'note-craft-secret-key', // 🔐 Change this to a strong secret in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true only if you're using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// === IBM App ID Auth ===
app.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME));
// IBM App ID callback route
app.get('/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
  failureRedirect: '/login-failed.html'
}), (req, res) => {
  res.redirect('/');
});

passport.use(new WebAppStrategy({
  clientId: process.env.CLIENT_ID,
  secret: process.env.CLIENT_SECRET,
  tenantId: process.env.TENANT_ID,
  oauthServerUrl: process.env.OAUTH_SERVER_URL,
  redirectUri: process.env.REDIRECT_URI
}));
const authenticate = passport.authenticate(WebAppStrategy.STRATEGY_NAME, { session: false });
*/

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Session setup
app.use(session({
  secret: 'note-craft-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Passport + IBM App ID
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === Authentication Routes ===
app.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME));

app.get('/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
  failureRedirect: '/login-failed.html'
}), (req, res) => {
  console.log("✅ Auth success for:", req.user.email);
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/logged-out.html'));
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  res.status(401).json({ error: 'Not authenticated' });
});

// === Protect API routes ===
app.use((req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).send('Unauthorized');
});

// ==== Your API Routes (add your notes/reminders logic below) ====
// app.get('/api/notes', ... )
// app.post('/api/notes', ... )

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


// ========== Notes APIs ==========
app.get('/api/notes', authenticate, (req, res) => {
  const userEmail = req.user.email;
  const notesPath = path.join(__dirname, 'notes.json');
  if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, '{}');
  }
  const allNotes = JSON.parse(fs.readFileSync(notesPath));
  const userNotes = allNotes[userEmail] || [];
  const nonReminderNotes = userNotes.filter(note => !note.date); // exclude notes with a "date"
  res.json(nonReminderNotes);
});

app.post('/api/notes', authenticate, (req, res) => {
  const userEmail = req.user.email;
  const newNote = req.body;
  const notesPath = path.join(__dirname, 'notes.json');
  let allNotes = {};

  if (fs.existsSync(notesPath)) {
    allNotes = JSON.parse(fs.readFileSync(notesPath));
  }

  if (!allNotes[userEmail]) {
    allNotes[userEmail] = [];
  }

  allNotes[userEmail].push(newNote);
  fs.writeFileSync(notesPath, JSON.stringify(allNotes, null, 2));
  console.log("New note saved:", note);
  res.status(201).json({ message: 'Note saved successfully' });
});

// ========== Update Note (Archive, Delete, Restore, etc.) ==========
app.put('/api/notes/:id', authenticate, (req, res) => {
  const userEmail = req.user.email;
  const noteId = req.params.id;
  const updatedFields = req.body;

  const notesPath = path.join(__dirname, 'notes.json');
  let allNotes = JSON.parse(fs.readFileSync(notesPath));
  let userNotes = allNotes[userEmail] || [];

  let index = userNotes.findIndex(note => note.id === noteId);
  if (index === -1) return res.status(404).json({ message: 'Note not found' });

  userNotes[index] = { ...userNotes[index], ...updatedFields };
  allNotes[userEmail] = userNotes;
  fs.writeFileSync(notesPath, JSON.stringify(allNotes, null, 2));

  res.json({ message: 'Note updated successfully' });
});

// ========== Permanently Delete Note ==========
app.delete('/api/notes/:id', authenticate, (req, res) => {
  const userEmail = req.user.email;
  const noteId = req.params.id;

  const notesPath = path.join(__dirname, 'notes.json');
  let allNotes = JSON.parse(fs.readFileSync(notesPath));
  let userNotes = allNotes[userEmail] || [];

  const newNotes = userNotes.filter(note => note.id !== noteId);
  allNotes[userEmail] = newNotes;
  fs.writeFileSync(notesPath, JSON.stringify(allNotes, null, 2));

  res.json({ message: 'Note permanently deleted' });
});


// ========== Reminders APIs ==========
app.get('/api/reminders', authenticate, (req, res) => {
  const userEmail = req.user.email;
  const pathRem = path.join(__dirname, 'reminders.json');
  if (!fs.existsSync(pathRem)) {
    fs.writeFileSync(pathRem, '{}'); // create an empty object for storing reminders per user
  }
  const allReminders = JSON.parse(fs.readFileSync(pathRem));
  const userReminders = allReminders[userEmail] || [];
  res.json(userReminders);
});

app.post('/api/reminders', authenticate, (req, res) => {
  const userEmail = req.user.email;
  const newReminder = req.body;
  const pathRem = path.join(__dirname, 'reminders.json');
  let allReminders = {};

  if (fs.existsSync(pathRem)) {
    allReminders = JSON.parse(fs.readFileSync(pathRem));
  }

  if (!allReminders[userEmail]) {
    allReminders[userEmail] = [];
  }

  allReminders[userEmail].push(newReminder);
  fs.writeFileSync(pathRem, JSON.stringify(allReminders, null, 2));
  res.status(201).json({ message: 'Reminder saved successfully' });
});

// ========== Start Server ==========
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
app.get('/logout', (req, res) => {
  res.redirect('/logged-out.html'); // Create this file in your public/ folder
});

