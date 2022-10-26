const express = require('express');
const dotenv = require('dotenv')
const router = express.Router();

dotenv.config()

const KEY = process.env.API_KEY

router.get('/' ,(req,res,next) => {
    if(req.user){
        res.send(req.user);
    }
    else{
        res.send(false)
    }
    
})

router.get('/search', (req,res,next)=> {

})

router.get('/activities', (req,res,next)=> {
    
})


modules.export = router