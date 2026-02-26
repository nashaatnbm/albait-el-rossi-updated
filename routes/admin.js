const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', adminController.getDashboard);
router.get('/customers', adminController.getCustomers);
router.get('/customer/:id/orders', adminController.getCustomerOrders);
router.post('/order/:id/status', adminController.updateOrderStatus);

// Products CRUD
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/:id/toggle-stock', adminController.toggleStock);

module.exports = router;
