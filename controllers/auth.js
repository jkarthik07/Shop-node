const crypto = require('crypto')//It is used to generate a random token for reseting the password

const bcrypt = require('bcryptjs')//To encrypt the passwords
const nodemailer = require('nodemailer')
// const mailgunTransport = require('nodemailer-mailgun-transport')
const { validationResult } = require('express-validator/check')//To validate the use input

const User = require('../models/user')

// const transporter = nodemailer.createTransport({
//     service: 'SendinBlue', // no need to set host or port etc.
//     auth: {
//         user: 'jkarthik0703@gmail.com',
//         pass: ''
//     }
// });
// NQCM7RZBBRMIHGBU - Mailgun authenticate code
 
const transporter = nodemailer.createTransport({
    // auth: {
    //     api_key: "af27c9c54ff2706ec2ecf7e72b546200-adf6de59-3dc230ee",
    //     domain: "sandbox81ceec4f4aaa4bddb4505a73e8386921.mailgun.org",
    //     url: "https://api.mailgun.net"
    // }
    host: 'smtp.gmail.com',
    port: 587,
    // Secure:	STARTTLS,
    auth: {
        user: 'jdaniles940@gmail.com',
        pass: 'JDaniles@07'
    }
})


exports.getLogin = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    } else{
        message = null;
    }
    // const loggedIn = req.get('Cookie').split('=')[1]==='true';
    console.log(req.session.isLoggedIn)
    res.render('auth/login',{
        pageTitle:'Login',
        path:'/login',
        errorMessage: message,
        oldInput:{
            email: '',
            password: ''
        },
        validationErrors: []
    })
}

exports.getSignup = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    } else{
        message = null;
    }
    res.render('auth/signup',{
        path:'/signup',
        pageTitle:'Signup',
        errorMessage: message,
        oldInput:{
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
}

exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: error.array()[0].msg,
            oldInput: {
              email: email,
              password: password
            },
            validationErrors: error.array()
          });
    }
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            return res.status(422).render('auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMessage: 'Invalid email or password.',
                oldInput: {
                  email: email,
                  password: password
                },
                validationErrors: []
              });
        }
        bcrypt.compare(password,user.password)
            .then(match=>{
                if(match){
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err=>{
                        console.log(err)
                        res.redirect('/')
                    });
                }
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    oldInput: {
                      email: email,
                      password: password
                    },
                    validationErrors: []
            });
        })
    })
    .catch(err=>console.log(err));
}

exports.postLogout = (req,res,next)=>{
    req.session.destroy((err)=>{
        console.log(err)
        res.redirect('/')
    })
}

exports.postSignup = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const error = validationResult(req)
    if(!error.isEmpty()){
        return res.status(422).render('auth/signup',{
            path:'/signup',
            pageTitle:'Signup',
            errorMessage: error.array()[0].msg,
            oldInput:{
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: error.array()
        })
    }
    bcrypt.hash(password,12)
        .then(bcryptPass=>{
            const user = new User({
                email: email,
                password: bcryptPass,
                cart: {items:[]}
            });
            return user.save();    
        })
        .then(result=>{
            res.redirect('/login')
            console.log("Mail send successfully")
            return transporter.sendMail({
                from: 'no-reply@shop.com <no-reply@enigmailer.com>',
                to: email,
                subject: 'Signup succeeded!',
                html: '<h1>You successfully signed up!</h1>'
            })
        })    
        .catch(err=>{
            console.log(err)
        })
        
}

exports.getReset = (req,res,next)=>{
    let message = req.flash('error');
    if(message.length>0){
        message = message[0];
    } else{
        message = null;
    }
    res.render('auth/reset',{
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    })
}

exports.postReset = (req,res,next)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex')
        User.findOne({email:req.body.email})
            .then(user=>{
                if(!user){
                    req.flash('error','No account with that email');
                    return res.redirect('/reset')
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 360000;
                return user.save()
            })
            .then(result=>{
                res.redirect('/login');
                return transporter.sendMail({
                    from: 'shop@gmail.com',
                    to: req.body.email,
                    subject: 'Reset Password',
                    html: `<p>You required a password reset</p>
                            <p>Click This <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>`
                })
            })
            .catch(err=>console.log(err))
    })
}

exports.getNewPassword = (req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
        .then(user=>{
            let message = req.flash('error');
            if(message.length>0){
                message = message[0];
            } else{
                message = null;
            }
            res.render('auth/new-password',{
                pageTitle:'New Password',
                path:'/new-password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            })
        })
        .catch(err=>console.log(err));

}

exports.postNewPassword = (req,res,next)=>{
    const newPassword = req.body.password;
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser;
    // let email;

    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration:{$gt: Date.now()},
        _id: userId})
        .then(user=>{
            resetUser = user;
            // email = user.email;
            return bcrypt.hash(newPassword,12)
        })
        .then(bcryptPass=>{
            resetUser.password = bcryptPass;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
            // return console.log(resetUser)
        })
        .then(result=>{
            res.redirect('/login');
            // return transporter.sendMail({
            //     from: 'shop@gmail.com',
            //     to: email,
            //     subject: 'Reset Password',
            //     html: '<h1>Password Reset Seccessfully</h1>'
            // })
        })
        .catch(err=>console.log(err))
}