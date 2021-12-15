const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{ 
            productId:{
                type: mongoose.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity:{
                type: Number,
                required: true
            }
        }]
    }
});

userSchema.methods.addToCart = function(product){
    const cartIndex = this.cart.items.findIndex(cp=>{
        return cp.productId.toString() === product._id.toString();
    });
    let newQty = 1;
    const updatedCartItems = [...this.cart.items];

    if(cartIndex >= 0){
        newQty = this.cart.items[cartIndex].quantity+1;
        updatedCartItems[cartIndex].quantity = newQty;
    } else{
        updatedCartItems.push({
            productId: product._id,
            quantity : newQty
        })
    }
    const updatedCart = {items: updatedCartItems };
    this.cart = updatedCart;
    return this.save();     
}

userSchema.methods.deleteCartItem = function(product){
    const updatedCart = this.cart.items.filter(p=>{
        return p.productId.toString() !== product.toString()
    })
    this.cart.items = updatedCart;
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart = {items:[]}
    return this.save()
}

module.exports = mongoose.model('User',userSchema)







// const getDb = require('../util/database').getDb;
// const mongoDb = require('mongodb');

// class User {
//     constructor ( username, email,cart,id){
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = new mongoDb.ObjectId(id);
//     }

//     save(){
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//     }

//     addToCart(product){
//         const cartIndex = this.cart.items.findIndex(cp=>{
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQty = 1;
//         const updatedCartItems = [...this.cart.items];

//         if(cartIndex >= 0){
//             newQty = this.cart.items[cartIndex].quantity+1;
//             updatedCartItems[cartIndex].quantity = newQty;
//         } else{
//             updatedCartItems.push({productId: new mongoDb.ObjectId(product._id),quantity : newQty})
//         }

//         const updatedCart = {items: updatedCartItems };
//         const db = getDb();
//         return db.collection('users').updateOne(
//             {_id: new mongoDb.ObjectId(this._id)},
//             {$set: {cart: updatedCart}}
//         )     
//     }

//     getCart(){
//         const db = getDb();
//         const productIds = this.cart.items.map(p=>{
//             return p.productId;
//         });

//         return db.collection('products').find({_id: {$in: productIds}})
//             .toArray()
//             .then(product=>{
//                 return product.map(p=>{
//                     return {
//                         ...p,
//                         quantity: this.cart.items.find(i=>{
//                             return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     }
//                 })
//             })
//     }

//     deleteCartItem(product){
//         const updatedCart = this.cart.items.filter(p=>{
//             return p.productId.toString() !== product.toString()
//         })
//         const db = getDb();
//         return db.collection('users').updateOne(
//             {_id: new mongoDb.ObjectId(this._id)},
//             {$set: {cart: {items:  updatedCart}}}
//         )     

//     }

//     // deleteOrder(id){
        
//     // }

//     addOrder(){
//         const db = getDb();
//         return this.getCart().then(products=>{
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongoDb.ObjectId(this._id),
//                     name: this.username
//                 }
//             };
//             return db.collection('orders').insertOne(order)  
//         })
//         .then(result=>{
//             this.cart = {items: []};
//             return db.collection('users').updateOne(
//                 {_id: new mongoDb.ObjectId(this._id)},
//                 {$set: {cart: {items: [] }}}
//             )
//         })
//     }

//     getOrder(){
//         const db = getDb();
//         return db.collection('orders')
//             .find({'user._id': new mongoDb.ObjectId(this._id)}) 
//             .toArray()
            

//     }

//     static findById(id){
//         const db = getDb()
//         return db.collection('users').findOne({_id:new mongoDb.ObjectId(id)})
//             .then(result=>{
//                 console.log(result)
//                 return result
//             })
//             .catch(err=>console.log(err))
//     }

// }

// module.exports = User;