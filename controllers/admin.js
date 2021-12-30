const Product = require('../models/product')
const {validationResult} = require('express-validator/check')
const mongoose = require('mongoose')
const fileHelper = require('../util/file')

exports.getProducts=(req,res,next)=>{
    res.render('admin/edit-products',
        {pageTitle:'Add Products',
        path:'/admin/add-products',
        editing: false,
        // isAuthenticate: req.session.isLoggedIn
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.postProducts=(req,res,next)=>{
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if(!image){
      return res.status(422).render('admin/edit-products',
        {pageTitle:'Add Products',
        path:'/admin/add-products',
        editing : false,
        hasError: true,
        product: {
          title:title,
          price: price,
          description: description
        },
        errorMessage: "Attached file is not an image",
        validationErrors: []
      });
    }
    const errors = validationResult(req)

    if(!errors.isEmpty()){
      return res.status(422).render('admin/edit-products',
        {pageTitle:'Add Products',
        path:'/admin/add-products',
        editing : false,
        hasError: true,
        product: {
          title:title,
          price: price,
          description: description
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }

    const imageUrl = image.path;

    const product = new Product({
      title: title, 
      price: price, 
      description: description, 
      imageUrl: imageUrl,
      userId: req.user
    });
    product.save()  
      .then(result=>{
        console.log(result)
        console.log("Table created and product added successfully");
        res.redirect('/admin/products');
      })
      .catch(err=>{
        //For MongoDb error handling (We render '/500' page)
        console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error);

        //Another method to handle server side error
        // res.redirect('/500')
        // return res.status(500).render('admin/edit-products',
        // {pageTitle:'Add Products',
        //   path:'/admin/add-products',
        //   editing : false,
        //   hasError: true,
        //   product: {
        //     title:title,
        //     imageUrl: imageUrl,
        //     price: price,
        //     description: description
        // },
        // errorMessage: "Database Operation failed",
        // validationErrors: []
      // })
        // console.log("error occurs!")
      })
}

exports.viewProducts=(req,res,next)=>{
  Product.find({userId: req.user._id})
    // .select('title price -_id')
    // .populate('userId','name')
    .then(products=>{
      // console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    })
}


exports.getEditProducts=(req,res,next)=>{
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect('/');
  }
  const editProd = req.params.productsId;
  Product.findById(editProd)
  // Product.findByPk(editProd)
    .then(products=>{
      if(!products){
        return res.redirect('/');
      }
      res.render('admin/edit-products',
        {pageTitle:'Edit Products',
        path:'/admin/edit-products',
        editing : editMode,
        product: products,
        hasError: true,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err=>{
        const error = new Error(err)
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postEditProducts = (req,res,next)=>{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;
  const errors = validationResult(req)
  
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-products',
      {pageTitle:'Edit Products',
      path:'/admin/edit-products',
      editing : true,
      hasError: true,
      product: {
        title:updatedTitle,
        price:updatedPrice,
        description:updatedDescription,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product=>{
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
      }
      product.title=updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if(image){
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = image.path;
      }
      return product.save()
        .then(result=>{
          console.log("SUCCESSFULLY UPDATED");
          res.redirect('/admin/products');
        })
    })
    .catch(err=>{
      const error = new Error(err)
      error.httpStatusCode = 500;
      return next(error);
    });
}

//Products can be deleted normally

// exports.postDelete = (req,res,next)=>{
//   const proId = req.body.productId;
//   Product.findById(proId)
//     .then(product=>{
//       if(!product){
//         return next(new Error('Product not found'));
//       }
//       fileHelper.deleteFile(product.imageUrl)
//       return Product.deleteOne({_id: proId, userId:req.user._id})
//     })
//     .then(result=>{
//       res.redirect('/admin/products');
//     })
//     .catch(err=>{
//       const error = new Error(err)
//       error.httpStatusCode = 500;
//       return next(error);
//     });
// }

//Product deleted asynchronously without page reloading
exports.deleteProduct = (req,res,next)=>{
  const proId = req.params.productId;
  Product.findById(proId)
    .then(product=>{
      if(!product){
        return next(new Error('Product not found'));
      }
      fileHelper.deleteFile(product.imageUrl)
      return Product.deleteOne({_id: proId, userId:req.user._id})
    })
    .then(()=>{
      console.log("Product deleted successfully")
      res.status(200).json({message: 'Product deleted Successfully'})
    })
    .catch(err=>{
      res.status(500).json({message:'Deleting Product Failed'})
    });
}

