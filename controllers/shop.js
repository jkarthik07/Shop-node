const Product = require('../models/product')
const Order = require('../models/order')
// const mongoose = require('mongoose')
// const Cart = require('../models/cart')

exports.getIndex=(req,res,next)=>{
  Product.find()
    .then(products=>{
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err=>console.log(err));
}

exports.productList=(req,res,next)=>{
  Product.find()
    .then(products=>{
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err=>console.log(err));
}


exports.getProdDetails=(req,res,next)=>{
    const prodId = req.params.id;
    Product.findById(prodId)
      .then(product=>{
        res.render('shop/product-detail', {
          prods: product,
          pageTitle: product.title,
          path: '/products'
        });
      })
      .catch(err=>console.log(err))
}


exports.getCart=(req,res,next)=>{
  req.user.populate('cart.items.productId')
    // .execPopulate()
    .then(user=>{
      // console.log(products)
      const products = user.cart.items;
      res.render('shop/cart',{
        pageTitle: 'Cart',
        path:'/cart',
        products: products
      });
    })
    .catch(err=>console.log(err));
};

exports.postCart=(req,res,next)=>{
    const proId = req.body.id;
    Product.findById(proId)
      .then(product=>{
        return req.user.addToCart(product)
      })
      .then(result=>{
        console.log(result)
        res.redirect('/cart')
      })
      .catch(err=>console.log(err))
}

exports.orders=(req,res,next)=>{
    Order.find({'user.userId':req.session.user._id})
      .then(orders=>{
        res.render('shop/orders',{
          pageTitle: 'Your Orders',
          path:'/orders',
          orders: orders
        })
      })
      .catch(err=>console.log(err));
}

exports.postOrders=(req,res,next)=>{

  req.user.populate('cart.items.productId')
    // .execPopulate()
    .then(user=>{
    // console.log(products)
      const products = user.cart.items.map(i=>{
        return {quantity: i.quantity, product: {...i.productId._doc}};
      });
      const order = new Order({
        user:{
          email: req.user.email,
          userId: req.user
        },
        products: products
      })
      return order.save();
    })
    .then(pro=>{
      return req.user.clearCart();
    })
    .then(result=>{
      res.redirect('/orders');
    })
    .catch(err=>console.log(err));
}

// exports.checkout=(req,res,next)=>{
//     res.render('shop/checkout',
//         {pageTitle:'Checkout',
//         path:'/checkout'
//     })
// }

exports.postCartDelete = (req,res,next)=>{
  const prodId = req.body.productId;
  req.user
    .deleteCartItem(prodId)
    .then(result =>{
      res.redirect('/cart');
    })
    .catch(err=>console.log(err))
    // ,(err)=>{
    //   if(!err){
    //     res.redirect('/cart');
    //   } else{
    //     console.log(err)
    //   }
}