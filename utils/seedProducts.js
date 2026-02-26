// utils/seedProducts.js
// Run once to seed default products into DB
const mongoose = require('mongoose');
const Product = require('../models/Product');

const defaultProducts = [
  { name: 'شوكولاتة روسية أصيلة', category: 'شوكولاتة وحلويات', price: 45, emoji: '🍫', badge: 'الأكثر مبيعاً', badgeColor: 'red', featured: true, order: 1 },
  { name: 'شاي روسي فاخر', category: 'شاي وقهوة', price: 60, emoji: '🍵', badge: 'جديد', badgeColor: 'green', featured: true, order: 2 },
  { name: 'فراء روسي طبيعي', category: 'فراء روسي', price: 850, emoji: '🧥', featured: true, order: 3 },
  { name: 'سكاكين روسية', category: 'سكاكين', price: 220, emoji: '🔪', featured: true, order: 4 },
  { name: 'مستحضرات تجميل روسية', category: 'مستحضرات تجميل', price: 130, emoji: '💄', featured: true, order: 5 },
  { name: 'مكملات غذائية', category: 'مكملات غذائية', price: 95, emoji: '💊', featured: true, order: 6 },
  { name: 'عسل روسي طبيعي', category: 'غذاء', price: 110, emoji: '🍯', badge: 'خصم', badgeColor: 'red', originalPrice: 140, featured: true, order: 7 },
];

async function seedProducts() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(defaultProducts);
    console.log('✅ تم إضافة المنتجات الافتراضية');
  }
}

module.exports = seedProducts;
