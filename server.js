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

// Read notes
app.get('/api/notes', (req, res) => {
  if (!fs.existsSync(NOTES_FILE)) return res.json([]);
  const data = fs.readFileSync(NOTES_FILE);
  res.json(JSON.parse(data));
});

// Save note
app.post('/api/notes', (req, res) => {
  const newNote = { id: uuidv4(), ...req.body };
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
