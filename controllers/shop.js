const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs') //use to read and show the invoice pdf to the user 
const path = require('path')
// const mongoose = require('mongoose')
// const Cart = require('../models/cart')
const PDFDoc = require('pdfkit') //use to generate invoice pdf

//Third party server to make payment
const stripe = require('stripe')(STRIPE_PRIVATE_KEY) 

let totalItems;
const ITEMS_PER_PAGE = 2

exports.getIndex=(req,res,next)=>{
  const page = +req.query.page || 1
  //Calculation for pagination (if has next page)
  Product.find()
    .countDocuments()
    .then(num=>{
      totalItems = num;
      return Product.find()
        .skip((page-1) * ITEMS_PER_PAGE) //skip the items according to page
        .limit(ITEMS_PER_PAGE) //how many items shown in per page
    })
    .then(products=>{
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page+1,
        previousPage: page-1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.productList=(req,res,next)=>{
  const page = +req.query.page || 1
  //Calculation for pagination (if has next page)
  Product.find()
    .countDocuments()
    .then(num=>{
      totalItems = num;
      return Product.find()
        .skip((page-1) * ITEMS_PER_PAGE) //skip the items according to page
        .limit(ITEMS_PER_PAGE) //how many items shown in per page
    })
    .then(products=>{
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page+1,
        previousPage: page-1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
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
      .catch(err=>{
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error);
      })
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
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
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
      .catch(err=>{
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error);
      })
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
      .catch(err=>{
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error);
      })
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
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
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
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
    // ,(err)=>{
    //   if(!err){
    //     res.redirect('/cart');
    //   } else{
    //     console.log(err)
    //   }
}

//code to read and show invoice pdf to the user 
exports.getInvoice = (req,res,next)=>{
  const orderId = req.params.orderId
  Order.findById(orderId)
    .then(order=>{
      if(!order){
        return next(new Error('No order Found'));
      }
      if(order.user.userId.toString() !== req.user._id.toString()){
        return next(new Error('Unauthorized'))
      }
      const invoiceName = 'invoice-'+ orderId +'.pdf';
      const invoicePath = path.join('data','invoices',invoiceName)
      
      //Code to create a new pdf and send it to the user 
      const pdfDoc = new PDFDoc();
      res.setHeader('Content-Type','application/pdf')
      res.setHeader('Content-Disposition',
        'inline; filename="'+ invoiceName+'"');
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res)

      pdfDoc.fontSize(25).text("Invoice",{
        underline: true
      });
      pdfDoc.text('----------------------');
      let totalPrice = 0;
      order.products.forEach(prod=>{
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.fontSize(15)
          .text(
            prod.product.title +'-'+ 
            prod.quantity + 'x' + '₹'+ 
            prod.product.price);
      })

      pdfDoc.text('---------')
      pdfDoc.fontSize(20).text(`TotalPrice: ₹${totalPrice}`)

      pdfDoc.end();

      //In this node read the existing pdf into memory and the combines it 
      // fs.readFile(invoicePath,(err,data)=>{
      //   if(err){
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type','application/pdf')
      //   res.setHeader('Content-Disposition','inline; filename="'+ invoiceName+'"')
      //   res.send(data)
      // })

      //It directly stream the existing pdf and send it as response
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type','application/pdf')
      // res.setHeader('Content-Disposition',
      //   'inline; filename="'+ invoiceName+'"'
      // );
      // file.pipe(res)
    })
    .catch(err=>console.log(err))
}

//Checkout with payments using stripe
exports.checkout = (req,res,next)=>{
  let total = 0;
  let products;
  req.user.populate('cart.items.productId')
    // .execPopulate()
    .then(user=>{
      // console.log(products)
      products = user.cart.items;
      products.forEach(p=>{
        total += p.quantity * p.productId.price
      })
      // console.log(total)
      //Code for stripe payment and provide user details
      
    //   return stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     line_items: products.map(p => {
    //       return {
    //         name: p.productId.title,
    //         description: p.productId.description,
    //         amount: p.productId.price * 100,
    //         currency: 'usd',
    //         quantity: p.quantity
    //       };
    //     }),
    //     success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
    //     cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
    //   });
    // })
    // .then(session => {
    //   res.render('shop/checkout', {
    //     path: '/checkout',
    //     pageTitle: 'Checkout',
    //     products: products,
    //     totalSum: total,
    //     sessionId: session.id
    //   });
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p=>{
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'inr',
            quantity: p.quantity
          };
        }),
        //Redirect to the success or cancel page according to transaction
        success_url: req.protocol + '://'+req.get('host')+'/checkout/success',
        cancel_url: req.protocol + '://'+ req.get('host') + '/checkout/cancel' 
      })
    })
    .then(session=>{
      res.render('shop/checkout',{
        pageTitle: 'Checkout',
        path:'/checkout',
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch(err=>{
      // console.log(err)
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
}

exports.checkoutSuccess = (req,res,next)=>{
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
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
}
