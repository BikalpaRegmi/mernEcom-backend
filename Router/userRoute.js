const express = require('express');
const User = require('../models/userSchema');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authenticate = require('../middlewares/authenticate');
const Products = require('../models/productSchema');
const stripe = require('stripe')('sk_test_51OLFUdSEvGRe73IhJpTRwIFx43XsBHvZlqegbOCb6J0W5vQtJGdjuyDU14saJMoaNrUWNJ8ryLRCRtVvpQjbIcdO00i5p5iNrw');
 
// for fetching all users in admin page
router.route('/getAllUser').get(async(req,res)=>{
   try {
      const userData = await User.find();
      res.json(userData)
   } catch (error) {
      res.json(error)
   }
})
// for deleting a user in admin page
router.route('/deleteUser/:id') .delete(async(req,res)=>{
   try {
      const {id} = req.params ;
      const deleteUser = await User.findByIdAndDelete({_id:id});
      res.json(deleteUser)
   } catch (error) {
      res.json(error)
   }
})

//for registeration
router.route('/register').post(async(req,res)=>{
   try {
    const user = new User(req.body)
    const userExists = await User.findOne({email:user.email})
    if(userExists)  res.json('E-mail already exists')
    else if(user.password !== user.confPassword) res.json({error:'password didnt matched'})
    else{
await user.save();
res.json({msg:'User registered sucessfully'})
}
   } catch (error) { 
    res.send(error)
   }
})

//for signIn
router.route('/signIn').post(async (req, res) => {
   try {
      const user = new User(req.body);
      const userExists = await User.findOne({ email: user.email });

      if (!userExists) {
        return res.json({ error: 'Email not found plz Register' });
      } else {
         const ispassmatched = await bcrypt.compare(user.password, userExists.password);
         if (ispassmatched) {
              
            const token = await userExists.generateAuthToken();

            res.cookie('ecommerceCookie' , token , {
               expires:new Date(Date.now() + 999999999),
               path:'/myapp',
               domain:'.netlify.app'
            })

            return res.json({ msg: 'Sign-in successful' });
         } else {
          return  res.json({ error: 'Wrong password' });
         }
      }
   } catch (error) {
       console.log(error)
   }
});

//for adding to cart
router.route('/cart/:id').post(authenticate , async(req,res)=>{
try {
   const {id} = req.params ;
   const cart = await Products.findOne({_id:id})

     const userContact = await User.findOne({_id : req.userId})
     

     if(userContact){
      await userContact.cartData(cart);
      await userContact.save()
      res.send(userContact)
     }else res.json({error:'invalid user'})

} catch (error) {
   res.statusCode(500).send(error)
}
}) 

//for getting items of cart
router.route('/cartDetails').get(authenticate ,async(req,res)=>{
   try {
      const details = await User.findById({_id:req.userId});
      res.json(details)
   } catch (error) {
      res.json('error :', error)
   }
}) 

//for getting items while refreshing by validating
router.route('/validUser').get(authenticate , async(req,res)=>{
   try {
      const validate = await User.findOne({_id:req.userId})
      res.json(validate)
   } catch (error) {
      console.log(error)
   }
})

//for deleting cart data
router.route('/remove/:id').delete(authenticate, async (req, res) => {
   try {
      const { id } = req.params;
      req.rootUser.carts = req.rootUser.carts.filter((curval) => {
         return curval._id != id;
      });
      await req.rootUser.save(); 
      res.json(req.rootUser);
   } catch (error) {
      res.send(error);
   }
});

//for signOut of user
router.route('/logOut').get(authenticate , async(req,res)=>{
try {
   req.rootUser.tokens = req.rootUser.tokens.filter((curval)=>{
      return curval.token !== req.token
   })
   res.clearCookie('ecommerceCookie' , {path:'/'})

  await req.rootUser.save();

   res.json(req.rootUser.tokens)

} catch (error) {
   res.json(error)
}
})

//for stripe payment
router.route('/createBuyNow').post(async(req,res)=>{
   const {product} = req.body ;
   const lineItems = product.map((curval)=>({
      price_data:{
         currency:'usd',
         product_data:{
            name:curval.title,
         },
         unit_amount: Math.round((curval.price - (curval.discount / 100) * curval.price) * 100 + 250),
      },
      quantity:1
   }));


   const session = await stripe.checkout.sessions.create({
      payment_method_types : ['card'],
      line_items:lineItems,
      mode: 'payment',
      success_url:`${process.env.baseUrl}/payment/sucess`,
      cancel_url:`${process.env.baseUrl}/payment/cancel`,
   });  
   res.json({id:session.id})
})



module.exports = router; 

