const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory storage
let users = [];
let folders = [];
let notes = [];
let currentId = 1;

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const user = { id: currentId++, email, password, name };
  users.push(user);
  
  // Create default folder
  folders.push({
    id: currentId++,
    userId: user.id,
    name: 'Recent Notes',
    color: '#87CEEB',
    icon: 'time-outline'
  });
  
  res.json({ token: 'fake-token', user: { id: user.id, email, name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  res.json({ token: 'fake-token', user: { id: user.id, email: user.email, name: user.name } });
});

// Folders routes
app.get('/api/folders', (req, res) => {
  const userFolders = folders.map(folder => ({
    ...folder,
    notes: notes.filter(note => note.folderId === folder.id)
  }));
  res.json(userFolders);
});

app.post('/api/folders', (req, res) => {
  const { name, color = '#6C63FF', icon = 'folder-outline' } = req.body;
  const folder = {
    id: currentId++,
    userId: 1, // Simplified
    name,
    color,
    icon,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  folders.push(folder);
  res.json({ ...folder, notes: [] });
});

// Notes routes
app.post('/api/notes', (req, res) => {
  const { title, folderId, content = '', type = 'handwritten', color = '#FF6B6B' } = req.body;
  const note = {
    id: currentId++,
    userId: 1, // Simplified
    folderId: parseInt(folderId),
    title,
    content,
    type,
    color,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  notes.push(note);
  res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id);
  const noteIndex = notes.findIndex(n => n.id === noteId);
  
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  notes[noteIndex] = { ...notes[noteIndex], ...req.body, updatedAt: new Date() };
  res.json(notes[noteIndex]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});