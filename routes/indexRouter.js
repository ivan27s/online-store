const {check,validationResult}=require('express-validator');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {StoreItem} =require('../db');
const { Op } = require("sequelize");


async function getFilteredList(filterParameters){
    const startPrice= filterParameters.startPrice || 0;
    const endPrice= filterParameters.endPrice ||  1000000;
    let order=[];
    if(filterParameters.sortRadio ==='sortExpensive'){
        order=[ [ 'price', 'DESC' ] ]
    }
    if(filterParameters.sortRadio ==='sortCheap'){
        order=[ [ 'price', 'ASC' ] ]
    }
    return await StoreItem.findAll({
        where: {
            price: {
                [Op.between]: [startPrice, endPrice],
            }
        },
        order
    });
}

/* GET home page. */
router.get('/', async function(req, res) {
    try {
        let list ;
        if(req.session.filterParameters) {
            list = await getFilteredList(req.session.filterParameters);
        }else {
            list = await StoreItem.findAll();
        }

        res.render('index', {
            list,
            isAuthenticated : req.session.isAuthenticated
        });
    }catch (e) {
        console.log(e)
    }
});

router.get('/usersItems',auth, async function(req, res, next) {
    try {
        const list = await StoreItem.findAll({where: {userId:req.session.user.id }});
        res.render('userItems', {
            list,
            isAuthenticated : req.session.isAuthenticated
        });
    }catch (e) {
        console.log(e)
    }
});

router.get('/itemDetail/:id',async function(req, res, next) {
    try {
        const item =await StoreItem.findByPk(req.params.id);
        res.render('itemDetail', {
            item: item,
            isAuthenticated : req.session.isAuthenticated
        });
    }catch (e) {
        console.log(e)
    }
});

router.get('/createPage',auth, async (req,res)=>{
    res.render('createPage',{
        isAuthenticated : req.session.isAuthenticated,
        alert: req.flash('alert'),
    })
});

router.post('/createItem',
    [
        check('title','Минимальная длина поля Название 6 символов').isLength({min:6}),
        check('image', 'В поле URL картинки введите ссылку на картинку').isURL(),
        check('price', 'Цена должна быть числом').isInt(),
        check('description', 'Минимальная длина поля Описание 15 символов').isLength({min:15})
    ],
    auth,
    async  function(req, res) {
    try {
        let errors =validationResult(req);
        if(!errors.isEmpty()){
            req.flash('alert', errors.array()[0].msg);
            return  res.redirect('/createPage')
        }
        const {title,image,price,description} =req.body;
        await StoreItem.create({
            title,
            image,
            price,
            description,
            userId: req.session.user.id
        });
        await res.redirect('/')
    }catch (e) {
        console.log(e)
    }
});

router.post('/removeItem/:id',auth, async (req,res)=>{
    try {
        StoreItem.destroy({
            where: {
                id: req.params.id,
                userId: req.session.user.id
            }
        })
    }catch (e) {
        console.log(e)
    }
    res.redirect('/usersItems')
});

router.post('/filterParameters',async  function(req, res) {
    let {sortRadio,startPrice,endPrice} =req.body;
    req.session.filterParameters = {
        startPrice,
        endPrice,
        sortRadio,
    };
    res.redirect('/');
});


module.exports = router;
