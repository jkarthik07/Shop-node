const express = require('express');
const path = require('path')
//Body Parser is used to parse text data from user input
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csrf = require('csurf')//Use to generate CSRF token(cross site request forgery)

//Path to join other folder file
const rootDir = require('./util/path');
const errorPage = require('./controllers/errors')
const User = require('./models/user')

const app = express();
const session = require('express-session');
const flash = require('connect-flash') 

//to store and delete error message from session
const multer = require('multer') 

//Multer use to parse files from user input
const mongoStore = require('connect-mongodb-session')(session)

//to locate template files
app.set('view engine',  'ejs');

//import routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const MONGO_URI = 'mongodb+srv://admin-jk:Jk0727@cluster0.kcslm.mongodb.net/shop1'
//To store session in mongoDb
const store = new mongoStore({
    uri: MONGO_URI,
    collection: 'sessions'
})

//to include css file
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));
// app.use(express.static("public"));

const csrfProtection = csrf();

//It's not working need to debug
// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, './images');
//     },
//     filename: (req, file, cb) => {
//       cb(null, new Date().toISOString() + '-' + file.originalname);
//     }
//   });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
//storage: fileStorage
app.use(bodyParser.urlencoded({extended :true}));
app.use(
    multer({ dest: 'images', fileFilter: fileFilter }).single('image')
  );//Multer use to parse files from user input

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
    
//Store the logged in status and csrfToken
app.use((req,res,next) =>  {
    res.locals.isAuthenticate = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

//Store the ID of the logged user in req.user
app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)
    // throw new Error("For check")
    .then(user=>{
        if(!user){
            return next()
        }
        req.user = user;
        next();
    })
    .catch(err=>{
        next(new Error(err))
    });
})


app.use('/admin',adminRoutes.routes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500',errorPage.get500)

app.use(errorPage.get400);

app.use((error,req,res,next)=>{
    console.log(error)
    res.redirect('/500')
    // console.log("hii")
    // console.log(req.session.isLoggedIn)
    // res.status(500).render('500',{
    //     pageTitle:'Error!',
    //     path:'/500',
    //     isAuthenticate: req.session.isLoggedIn
    // });
})

mongoose.connect(MONGO_URI)
    .then(result=>{
        app.listen(3000)
        console.log("Server started successfully");
    })
    .catch(err=>console.log(err))

//if we use "npm start" command to run project then u need to 
// add "start":"nodemon app.js" to script in package.json file

