const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title:{
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  imageUrl:{
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Product',productSchema);








// const getDb = require('../util/database').getDb;
// const mongoDb = require('mongodb');
// const User = require('./user')

// class Product {
//   constructor( title, price, description, imageUrl, id,userid){
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ?  new mongoDb.ObjectId(id) : null ;
//     this.userId = userid;
//   }

//   save(){
//     const db = getDb();
//     let dbOp ;
//     if(this._id){
//       dbOp = db.collection('products').updateOne({_id:this._id},{$set: this})
//     } else{
//         dbOp = db.collection('products').insertOne(this)
//     }
//     return dbOp
//       .then(result=>console.log(result))
//       .catch(err=>console.log(err));
//   }

//   static fetchAll(){
//     const db = getDb();
//     return db.collection('products').find().toArray()
//       .then(products=>{
//         console.log(products);
//         return products;
//       })
//       .catch(err=>console.log(err))
//   }

//   static findById(id){
//     const db = getDb();
//     return db.collection('products').find({_id: new mongoDb.ObjectId(id)}).next()
//       .then(result=>{
//         console.log(result)
//         return result;
//       })
//       .catch(err=>console.log(err));
//   }

//   static deleteById(id){
//     const db = getDb();
//     const proId = id
//     return db.collection('products').deleteOne({_id: new mongoDb.ObjectId(id)})
//       // .then(product=>{
//       //   db.collection('users').deleteOne({_id: new mongoDb.ObjectId(id)})
//       //     .then(()=>console.log("Successfully Deleted from user"))
//       //     .catch(err=>console.log("Product not found in user"))
//       // })
//       .then(result=>{
//         console.log("Successfully Deleted");
//       })
//       .catch(err=>console.log(err))
//   }

// }

// // const Product = sequelize.define('product',{
// //   id:{
// //     type: Sequelize.INTEGER,
// //     allowNull: false,
// //     autoIncrement: true,
// //     primaryKey: true
// //   },
// //   title: Sequelize.STRING,
// //   price:{
// //     type: Sequelize.DOUBLE,
// //     allowNull: false,
// //   },
// //   imageUrl:{
// //     type: Sequelize.STRING,
// //     allowNull: false
// //   },
// //   description:{
// //     type: Sequelize.STRING,
// //     allowNull: false
// //   }
// // })

// module.exports = Product;