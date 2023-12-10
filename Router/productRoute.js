const express = require('express')
const router = express.Router();
const Product = require('../models/productSchema')
const multer = require('multer')
const path = require('path')
const fs = require('fs');


const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null , 'public/images')
    },
    filename:(req,file,cb)=>{
    const generatedFilename = file.fieldname + "_" + Date.now() + path.extname(file.originalname);
    cb(null, generatedFilename);
    }
  });
  
  const upload = multer({storage:storage})


router.route('/getAllProduct').get(async(req,res)=>{
  try {
    const products = await Product.find();
    res.json(products)
  } catch (error) {
    res.send(error)
}
})

router.route('/createProduct').post(upload.single('file') ,async(req,res)=>{
    try {
        const {title,price,discount,Description,category} = req.body ;
        const image = req.file.filename ;
   
            const newProduct = new Product({
                image,
                title,
                price,
                discount,
                Description,
                category,
            });
            await newProduct.save();
            res.json(newProduct)
        
        
    } catch (error) {
res.send(error)
    }
})

router.route('/getProduct/:id').get(async(req,res)=>{
    try {
        const id = req.params.id;
        const proData = await Product.findById({_id:id})
        res.json(proData);
    } catch (error) {
        res.send(error)
    }
})
router.route('/deleteProduct/:id').delete(async(req,res)=>{
    try {
        const id = req.params.id ;
        const productData = await Product.findByIdAndDelete({_id:id})
        const imagePath = path.join(__dirname, `../public/images/${productData.image}`);
        fs.unlinkSync(imagePath);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });

    }
})

module.exports = router