// index.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const blogRoutes = require('./routes/blog');
const userRoutes = require('./routes/user');
const Blog = require('./models/blog');

const app = express();
const PORT = process.env.PORT || 9000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/blogg';

// ─── Database ──────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB is connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ─── View Engine ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/blog', blogRoutes);
app.use('/user', userRoutes);

// ─── Home Route ────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({});
    res.render('home', { user: req.user, blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// ─── Fallback for Undefined Routes ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { user: req.user });
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
