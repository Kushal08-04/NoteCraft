require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Session setup
app.use(session({
  secret: 'noter_app_secret',
  resave: false,
  saveUninitialized: true,
}));

// Passport setup
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

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication routes
app.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME));
app.get('/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
  failureRedirect: '/login',
  successRedirect: '/'
}));
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) res.json(req.user);
  else res.status(401).json({ error: 'Not authenticated' });
});

// Protect these routes
app.use((req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).send('Unauthorized');
});

// Notes storage path
const NOTES_FILE = path.join(__dirname, 'notes.json');
const REMINDERS_FILE = path.join(__dirname, 'reminders.json');

// Read notes
app.get('/api/notes', (req, res) => {
  if (!fs.existsSync(NOTES_FILE)) return res.json([]);
  const data = fs.readFileSync(NOTES_FILE);
  const allNotes = JSON.parse(data);
  const userNotes = allNotes.filter(note => note.user === req.user.email); // ✅ filter by user
  res.json(userNotes);
});


// Get reminders
app.get('/api/reminders', (req, res) => {
  if (!fs.existsSync(REMINDERS_FILE)) return res.json([]);
  const data = fs.readFileSync(REMINDERS_FILE);
  const allReminders = JSON.parse(data);
  const userReminders = allReminders.filter(r => r.user === req.user.email); // ✅ filter by user
  res.json(userReminders);
});


// Add reminder
app.post('/api/reminders', (req, res) => {
  const { title, description, date } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'Title and date are required' });
  }
  const newReminder = {
    id: uuidv4(),
    user: req.user.email, // User-specific reminders
    title,
    description,
    date
  };

  let reminders = [];
  if (fs.existsSync(REMINDERS_FILE)) {
    reminders = JSON.parse(fs.readFileSync(REMINDERS_FILE));
  }

  reminders.push(newReminder);
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders));
  res.status(201).json(newReminder);
});

// Delete reminder
app.delete('/api/reminders/:id', (req, res) => {
  if (!fs.existsSync(REMINDERS_FILE)) return res.status(404).json({ error: 'Reminder file not found' });

  let reminders = JSON.parse(fs.readFileSync(REMINDERS_FILE));
  reminders = reminders.filter(r => r.id !== req.params.id);
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders));
  res.status(200).json({ message: 'Reminder deleted' });
});

// Save note
app.post('/api/notes', (req, res) => {
  const newNote = { id: uuidv4(),
    user: req.user.email,
     title,
    content,
    folder: folder || null,
    dateCreated: dateCreated || new Date().toISOString() };
  let notes = [];
  if (fs.existsSync(NOTES_FILE)) {
    notes = JSON.parse(fs.readFileSync(NOTES_FILE));
  }
  notes.push(newNote);
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes));
  res.status(201).json(newNote);
});

app.listen(PORT, () => {
console.log(`✅ Server running at http://localhost:${PORT}`);
console.log(`🔐 IBM App ID Redirect URI: ${process.env.REDIRECT_URI}`);

});
