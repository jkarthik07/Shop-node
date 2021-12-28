const express = require('express');
const path = require('path');
const router = express.Router();
const rootDir = require('../util/path');
const addProds = require('../controllers/admin');
const {body} = require('express-validator/check') //Use to validate user input

//To check wheather the user is logged in or not
const isAuth = require('../middleware/is-auth');


router.get('/add-products',isAuth,addProds.getProducts);
router.post('/add-product',[
    body('title')
        .isString()
        .isLength({min:3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5,max:400})
        .trim()
    ],
    isAuth,addProds.postProducts); 
router.get('/products',isAuth,addProds.viewProducts);
router.get('/edit-products/:productsId',isAuth,addProds.getEditProducts);
router.post('/edit-products',[
    body('title')
        .isString()
        .isLength({min:3})
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5,max:400})
        .trim()
    ],
    isAuth,addProds.postEditProducts);
router.post('/delete-product',isAuth,addProds.postDelete);                                                     

exports.routes = router;