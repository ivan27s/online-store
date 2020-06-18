const express = require('express');
const router = express.Router();
const {check,validationResult}=require('express-validator')
const bcrypt = require('bcryptjs');
const {User} =require('../db');


router.get('/authPage', async (req,res)=>{
    res.render('authPage',{
        isAuthenticated : req.session.isAuthenticated,
        alert: req.flash('alert'),
    })
});
router.post('/register',
    [
        check('registerEmail','Некорректный email, попробуйте снова').isEmail(),
        check('registerPassword', 'Минимальная длина пароля 6 символов, попробуйте снова')
            .isLength({min:6})
    ],
    async  function(req, res) {
    try {
        const errors =validationResult(req);
        if(!errors.isEmpty()){
            req.flash('alert', errors.array()[0].msg);
            return res.redirect('/auth/authPage')
        }

        const {registerEmail,registerPassword,age} =req.body;

        const candidate = await User.findOne({where: {email: registerEmail}});
        if (candidate){
            req.flash('alert', 'Такой пользователь уже существует');
            return res.redirect('/auth/authPage')
        }
        const hashPassword =await bcrypt.hash(registerPassword, 10);

        await User.create({
            email: registerEmail,
            password: hashPassword,
            age: age
        });
        req.flash('alert', 'Пользователь создан');
        res.redirect('/auth/authPage')

    }catch (e) {
        console.log(e)
    }

});

router.post('/login',
    [
        check('loginEmail','Введите корректный email').normalizeEmail().isEmail(),
        check('loginPassword', 'Введите пароль').exists()
    ],
    async function(req, res) {
    try {
        let errors =validationResult(req);
        if(!errors.isEmpty()){
            req.flash('alert', errors.array()[0].msg);
             return res.redirect('/auth/authPage')
        }
        const {loginEmail,loginPassword} =req.body;
        const candidate = await User.findOne({where: {email: loginEmail}});
        if (candidate) {
            const areSame = await bcrypt.compare(loginPassword, candidate.password);
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                res.redirect('/')
            }else {
                req.flash('alert', 'Неверный пароль');
                res.redirect('/auth/authPage')
            }
        }else {
            req.flash('alert', 'Такого пользователя не существует');
            res.redirect('/auth/authPage')
        }
    }catch (e) {
        console.log(e)
    }

});


router.post('/logout',async  function(req, res) {
    req.session.destroy();
    res.redirect('/')
});

module.exports = router;