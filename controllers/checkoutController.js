const Order = require('../models/Order');
const User = require('../models/User');
const { sendTelegramNotification } = require('../utils/telegram');

// Products list (can be moved to DB later)
const PRODUCTS = [
  { id: 1, name: 'شوكولاتة روسية أصيلة', price: 45, category: 'شوكولاتة وحلويات', emoji: '🍫' },
  { id: 2, name: 'شاي روسي فاخر', price: 60, category: 'شاي وقهوة', emoji: '🍵' },
  { id: 3, name: 'قهوة روسية', price: 75, category: 'شاي وقهوة', emoji: '☕' },
  { id: 4, name: 'فراء روسي طبيعي', price: 850, category: 'فراء روسي', emoji: '🧥' },
  { id: 5, name: 'سكاكين روسية', price: 220, category: 'سكاكين', emoji: '🔪' },
  { id: 6, name: 'مستحضرات تجميل روسية', price: 130, category: 'مستحضرات تجميل', emoji: '💄' },
  { id: 7, name: 'مكملات غذائية', price: 95, category: 'مكملات غذائية', emoji: '💊' },
  { id: 8, name: 'عسل روسي طبيعي', price: 110, category: 'مكملات غذائية', emoji: '🍯' }
];

// GET /checkout
exports.getCheckout = async (req, res) => {
  try {
    res.render('checkout/checkout', {
      title: 'إتمام الطلب',
      products: PRODUCTS
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// POST /checkout
exports.postCheckout = async (req, res) => {
  try {
    const { fullName, phone, city, address, notes, items } = req.body;

    // Parse items
    let orderItems = [];
    if (Array.isArray(items)) {
      orderItems = items
        .map(i => {
          const product = PRODUCTS.find(p => p.id === parseInt(i.productId));
          if (!product || !i.quantity || parseInt(i.quantity) < 1) return null;
          return {
            productName: product.name,
            quantity: parseInt(i.quantity),
            price: product.price
          };
        })
        .filter(Boolean);
    }

    if (orderItems.length === 0) {
      return res.render('checkout/checkout', {
        title: 'إتمام الطلب',
        products: PRODUCTS,
        error: 'يرجى اختيار منتج واحد على الأقل'
      });
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.session.userId,
      items: orderItems,
      totalAmount,
      shippingAddress: { fullName, phone, city, address },
      notes: notes || '',
      status: 'pending'
    });

    // Send Telegram notification
    const user = await User.findById(req.session.userId);
    await sendTelegramNotification(order, user);

    res.redirect(`/orders/${order._id}/success`);
  } catch (err) {
    console.error(err);
    res.render('checkout/checkout', {
      title: 'إتمام الطلب',
      products: PRODUCTS,
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى'
    });
  }
};

// GET /orders/:id/success
exports.getOrderSuccess = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order || order.user._id.toString() !== req.session.userId.toString()) {
      return res.redirect('/');
    }
    res.render('checkout/success', {
      title: 'تم الطلب بنجاح',
      order
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

// GET /my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
    res.render('checkout/my-orders', {
      title: 'طلباتي',
      orders
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};
