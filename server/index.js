const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const DATA_DIR = path.join(__dirname, 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple admin token (for demo). In production use proper auth.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'secret-admin-token';

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(filePath) {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function writeJSON(filePath, data) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized (invalid admin token)' });
}

function generateToken() {
  return (Date.now() + Math.floor(Math.random() * 100000)).toString(36);
}

function requireUser(req, res, next) {
  const token = req.headers['x-user-token'];
  if (!token) return res.status(401).json({ error: 'Missing user token' });
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.token === token);
  if (!user) return res.status(401).json({ error: 'Invalid user token' });
  req.user = user;
  return next();
}

// List all listings (admin)
app.get('/api/listings', requireAdmin, (req, res) => {
  const listings = readJSON(LISTINGS_FILE);
  res.json(listings);
});

// Get pending listings (public read allowed for demo)
app.get('/api/pending-listings', (req, res) => {
  const listings = readJSON(LISTINGS_FILE);
  res.json(listings.filter(l => l.status === 'pending'));
});

// Approve a listing
app.post('/api/listings/:id/approve', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const listings = readJSON(LISTINGS_FILE);
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Listing not found' });
  listings[idx].status = 'approved';
  listings[idx].reviewedAt = new Date().toISOString();
  listings[idx].reviewer = req.headers['x-admin-name'] || 'admin';
  writeJSON(LISTINGS_FILE, listings);
  res.json({ success: true, listing: listings[idx] });
});

// Reject a listing
app.post('/api/listings/:id/reject', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { reason } = req.body || {};
  const listings = readJSON(LISTINGS_FILE);
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Listing not found' });
  listings[idx].status = 'rejected';
  listings[idx].rejectedAt = new Date().toISOString();
  listings[idx].rejectedReason = reason || '';
  listings[idx].reviewer = req.headers['x-admin-name'] || 'admin';
  writeJSON(LISTINGS_FILE, listings);
  res.json({ success: true, listing: listings[idx] });
});

// For demo: add a listing (public)
app.post('/api/listings', (req, res) => {
  const listings = readJSON(LISTINGS_FILE);
  const payload = req.body || {};
  const ownerToken = req.headers['x-user-token'];
  let ownerId = null;
  if (ownerToken) {
    const users = readJSON(USERS_FILE);
    const owner = users.find(u => u.token === ownerToken);
    if (owner) ownerId = owner.id;
  }
  const newListing = Object.assign({
    id: Date.now(),
    name: payload.name || '未命名车辆',
    price: payload.price || '¥0',
    specs: payload.specs || '',
    location: payload.location || '',
    description: payload.description || '',
    images: payload.images || [],
    ownerId: ownerId,
    status: 'pending',
    createdAt: new Date().toISOString()
  }, payload);
  listings.push(newListing);
  writeJSON(LISTINGS_FILE, listings);
  res.status(201).json(newListing);
});

// Public approved listings
app.get('/api/approved-listings', (req, res) => {
  const listings = readJSON(LISTINGS_FILE);
  res.json(listings.filter(l => l.status === 'approved'));
});

// User registration
app.post('/api/users/register', (req, res) => {
  const body = req.body || {};
  if (!body.username || !body.password) return res.status(400).json({ error: 'username and password required' });
  const users = readJSON(USERS_FILE);
  if (users.find(u => u.username === body.username)) return res.status(400).json({ error: 'username exists' });
  const newUser = {
    id: Date.now(),
    username: body.username,
    password: body.password,
    name: body.name || '',
    phone: body.phone || '',
    token: generateToken(),
    role: 'user',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  const { password, ...safe } = newUser;
  res.status(201).json(safe);
});

// User login
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  user.token = generateToken();
  writeJSON(USERS_FILE, users);
  const { password: pw, ...safe } = user;
  res.json(safe);
});

// Get current user
app.get('/api/users/me', requireUser, (req, res) => {
  const { password, ...safe } = req.user;
  res.json(safe);
});

// Purchase a listing (create transaction)
app.post('/api/listings/:id/purchase', requireUser, (req, res) => {
  const id = Number(req.params.id);
  const listings = readJSON(LISTINGS_FILE);
  const idx = listings.findIndex(l => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Listing not found' });
  const listing = listings[idx];
  if (listing.status !== 'approved') return res.status(400).json({ error: 'Listing not available for purchase' });
  listing.status = 'sold';
  listing.buyerId = req.user.id;
  listing.soldAt = new Date().toISOString();
  // create transaction
  const transactions = readJSON(TRANSACTIONS_FILE);
  const tx = {
    id: Date.now(),
    listingId: listing.id,
    buyerId: req.user.id,
    sellerId: listing.ownerId || null,
    price: listing.price || null,
    createdAt: new Date().toISOString()
  };
  transactions.push(tx);
  writeJSON(TRANSACTIONS_FILE, transactions);
  writeJSON(LISTINGS_FILE, listings);
  res.json({ success: true, transaction: tx, listing });
});

// Admin: get all transactions
app.get('/api/transactions', requireAdmin, (req, res) => {
  const transactions = readJSON(TRANSACTIONS_FILE);
  res.json(transactions);
});

// Get transactions for a user (user or admin)
app.get('/api/users/:id/transactions', requireUser, (req, res) => {
  const userId = Number(req.params.id);
  if (req.user.id !== userId && req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const transactions = readJSON(TRANSACTIONS_FILE);
  const filtered = transactions.filter(t => t.buyerId === userId || t.sellerId === userId);
  res.json(filtered);
});
 

app.listen(PORT, () => {
  console.log(`Admin review server running on http://localhost:${PORT}`);
  console.log(`Admin token (demo): ${ADMIN_TOKEN}`);
});
