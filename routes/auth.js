const express = require('express');
const { check,body } = require('express-validator/check');

const authControl = require('../controllers/auth')
const User = require('../models/user')

const router = express.Router();


router.get('/login',authControl.getLogin);
router.get('/signup',authControl.getSignup);
router.post(
    '/login',[
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .normalizeEmail(),
        body('password','Please enter a correct password')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authControl.postLogin);
router.post('/logout',authControl.postLogout);
router.post(
    '/signup',[
        check('email')
            .isEmail()
            .withMessage('Please enter a vaild email')
            .custom((value,{req})=>{
            //     if(value==='test@test.com'){
            //         throw new Error('This email address is forbidden')
            //     }
            //     return true;
                return User.findOne({email:value}).then(userDoc=>{
                    if(userDoc){
                        // console.log("Email already exists")
                        return Promise.reject(
                            'E-mail already exists,Please pick different one'
                        );
                    }
                })
            })
            .normalizeEmail(),//To sanitize user input(remove capital letteres in email)
        body('password','Please enter a password with numbers and text and atleast 5 characters')
            .isLength({min:5})
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error("Password doesn't match")
            }
            return true;
        })
    ],
    authControl.postSignup);
router.get('/reset',authControl.getReset);
router.post('/reset',authControl.postReset);
router.get('/reset/:token',authControl.getNewPassword);
router.post('/new-password',authControl.postNewPassword)

module.exports = router;