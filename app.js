const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csrf = require('csurf')//Use to generate CSRF token(cross site request forgery)

//Path to join other folder file
const rootDir = require('./util/path');
const errorPage = require('./controllers/errors')
const User = require('./models/user')

const app = express();

//to locate template files
app.set('view engine', 'ejs');

//import routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash') //to store and delete error message from session

const MONGO_URI = 'mongodb+srv://admin-jk:Jk0727@cluster0.kcslm.mongodb.net/shop1'
const store = new mongoStore({
    uri: MONGO_URI,
    collection: 'sessions'
})

const csrfProtection = csrf();

app.use(bodyParser.urlencoded({extended :true}));
//to include css file
// app.use(express.static(path.join(__dirname,'public')));
app.use(express.static("public"));
app.use(
    session({
        secret: 'hash keyword',
        resave: false, 
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtection)
app.use(flash())

app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    .then(user=>{
        req.user = user;
        next();
    })
    .catch(err=>console.log(err));
})

app.use((req,res,next) =>  {
    res.locals.isAuthenticate = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin',adminRoutes.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorPage.error);

mongoose.connect(MONGO_URI)
    .then(result=>{
        app.listen(3000)
        console.log("Server started successfully");
    })
    .catch(err=>console.log(err))

//if we use "npm start" command to run project then u need to 
// add "start":"nodemon app.js" to script in package.json file

