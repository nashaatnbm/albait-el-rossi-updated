const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// GET /admin
exports.getDashboard = async (req, res) => {
  try {
    const statusFilter = req.query.status || '';

    const query = statusFilter ? { status: statusFilter } : {};

    const [orders, totalOrders, pendingOrders, totalCustomers] = await Promise.all([
      Order.find(query).populate('user', 'name email phone').sort({ createdAt: -1 }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'customer' })
    ]);

    // Revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.render('admin/dashboard', {
      title: 'لوحة التحكم',
      orders,
      stats: { totalOrders, pendingOrders, totalCustomers, totalRevenue },
      statusFilter
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'خطأ في تحميل البيانات', user: req.session });
  }
};

// GET /admin/customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    // Get order count per customer
    const customersWithOrders = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ user: c._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: c._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        return {
          ...c.toObject(),
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );

    res.render('admin/customers', {
      title: 'العملاء',
      customers: customersWithOrders
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'خطأ في تحميل البيانات', user: req.session });
  }
};

// GET /admin/customer/:id/orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return res.redirect('/admin/customers');

    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });

    res.render('admin/customer-orders', {
      title: `طلبات ${customer.name}`,
      customer,
      orders
    });
  } catch (err) {
    console.error(err);
    res.redirect('/admin/customers');
  }
};

// POST /admin/order/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ====== PRODUCTS ======

// GET /admin/products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ order: 1, createdAt: 1 });
    const categories = [...new Set(products.map(p => p.category))];
    res.render('admin/products', {
      title: 'إدارة المنتجات',
      products,
      categories,
      flash: req.session.flash || null
    });
    delete req.session.flash;
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'خطأ في تحميل المنتجات', user: req.session });
  }
};

// POST /admin/products
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json({ success: true, product });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// PUT /admin/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// DELETE /admin/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// POST /admin/products/:id/toggle-stock
exports.toggleStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.inStock = !product.inStock;
    await product.save();
    res.json({ success: true, inStock: product.inStock });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
