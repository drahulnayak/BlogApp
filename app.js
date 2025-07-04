// index.js
require('dotenv').config()
const path            = require('path');
const express         = require('express');
const mongoose        = require('mongoose');
const cookieParser    = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const blogRoutes = require('./routes/blog');
const userRoutes = require('./routes/user');
const Blog       = require('./models/blog');

const app  = express();
const PORT = process.env.PORT || 9000;

// ─── Database ──────────────────────────────────────────────────────────────
// mongoose.connect('mongodb://127.0.0.1:27017/blogg', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("✅ MongoDB is connected"))
// .catch(err => console.error("❌ MongoDB connection error:", err));
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB is connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ─── View Engine ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// ─── Middleware ───────────────────────────────────────────────────────────
// parse urlencoded bodies + JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// serve static assets
app.use(express.static(path.resolve(__dirname, 'public')));
// parse cookies into req.cookies
app.use(cookieParser());
// read cookie & validate JWT (if present); sets req.user
app.use(checkForAuthenticationCookie('token'));
// expose req.user into all EJS templates as currentUser
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/blog', blogRoutes);
app.use('/user', userRoutes);

// Home page
app.get('/', async (req, res) => {
  console.log(`req.user `, req.user);
  try {
    const blogs = await Blog.find({});
    res.render('home', {user: req.user,  blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
