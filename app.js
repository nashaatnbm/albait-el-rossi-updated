require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const { attachUser } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const checkoutRoutes = require('./routes/checkout');
const seedProducts = require('./utils/seedProducts');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Database =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Nashaat:<mnbvcxzNn9900>@cluster0.nyrqiul.mongodb.net/?appName=Cluster0')
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedProducts();
  })
  .catch(err => console.error('❌ MongoDB error:', err));

// ===== View Engine =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== Middleware =====
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'albait-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/albait-el-rossi',
    ttl: 7 * 24 * 60 * 60 // 7 days
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true
  }
}));

// Attach user to all views
app.use(attachUser);

const Product = require('./models/Product');

// ===== Routes =====
app.get('/', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true }).sort({ order: 1, createdAt: 1 });
    res.render('index', { title: 'الرئيسية', products });
  } catch (err) {
    res.render('index', { title: 'الرئيسية', products: [] });
  }
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', checkoutRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'الصفحة التي تبحث عنها غير موجودة',
    user: req.session
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    message: 'حدث خطأ في الخادم',
    user: req.session
  });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 البيت الروسي running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
});
