const express = require('express');
const path = require('path');
const router = express.Router();
const rootDir = require('../util/path');
const shop = require('../controllers/shop');
const isAuth = require('../middleware/is-auth')


router.get('/',shop.getIndex);
router.get('/products',shop.productList);
router.get('/products/:id',shop.getProdDetails);
router.get('/cart',isAuth,shop.getCart);
router.post('/cart',isAuth,shop.postCart);
router.post('/cart-delete-item',isAuth,shop.postCartDelete);

router.get('/orders',isAuth,shop.orders);
router.post('/orders',isAuth,shop.postOrders)
// router.get('/checkout',shop.checkout);
router.get('/orders/:orderId',isAuth,shop.getInvoice)

module.exports = router;