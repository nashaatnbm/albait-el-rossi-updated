const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: null }, // for discount display
  emoji: { type: String, default: '📦' },
  description: { type: String, default: '' },
  badge: { 
    type: String, 
    enum: ['', 'جديد', 'الأكثر مبيعاً', 'خصم', 'نفد المخزون'],
    default: '' 
  },
  badgeColor: { type: String, default: 'green' }, // green | red | gold
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
