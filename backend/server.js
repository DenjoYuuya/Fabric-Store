// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS (so your frontend on localhost:3000 or similar can talk to it)
app.use(cors());
app.use(express.json());

// In-memory "database"
let products = [
  { id: 1, name: "Product 1", price: 19.99, image: "https://via.placeholder.com/250" },
  { id: 2, name: "Product 2", price: 24.99, image: "https://via.placeholder.com/250" },
  { id: 3, name: "Product 3", price: 29.99, image: "https://via.placeholder.com/250" },
  { id: 4, name: "Product 4", price: 34.99, image: "https://via.placeholder.com/250" }
];

// Simple in-memory cart storage: { sessionId: [{ productId, quantity }] }
const carts = {};

// Helper: generate simple session ID (in real apps, use signed cookies or JWT)
const getSessionId = (req) => {
  if (!req.headers.authorization) {
    return 'default-session'; // fallback for demo
  }
  return req.headers.authorization.replace('Bearer ', '');
};

// === API ROUTES ===

// GET /api/products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// POST /api/cart/add
app.post('/api/cart/add', (req, res) => {
  const sessionId = getSessionId(req);
  const { productId, quantity = 1 } = req.body;

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (!carts[sessionId]) carts[sessionId] = [];

  const existingItem = carts[sessionId].find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[sessionId].push({ productId, quantity });
  }

  res.json({ message: 'Added to cart', cart: carts[sessionId] });
});

// GET /api/cart
app.get('/api/cart', (req, res) => {
  const sessionId = getSessionId(req);
  const cart = carts[sessionId] || [];
  res.json(cart);
});

// Basic root route
app.get('/', (req, res) => {
  res.send('MyStore Backend is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});