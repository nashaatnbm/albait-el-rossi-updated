const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { requireAuth } = require('../middleware/auth');

router.get('/checkout', requireAuth, checkoutController.getCheckout);
router.post('/checkout', requireAuth, checkoutController.postCheckout);
router.get('/orders/:id/success', requireAuth, checkoutController.getOrderSuccess);
router.get('/my-orders', requireAuth, checkoutController.getMyOrders);

module.exports = router;
