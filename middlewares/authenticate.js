const jwt = require('jsonwebtoken')
const User = require('../models/userSchema')

const authenticate = async(req,res,next) =>{
 try {
    const token = req.cookies.ecommerceCookie;
    const verifyToken = jwt.verify(token,'sundaymondaytuesdaywednesdaythursdayfridaysaturday'); 


    const rootUser = await User.findOne({_id:verifyToken.userId , "tokens.token":token})

    if(!rootUser) throw new Error ("user not found")

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;
    
    next();

 } catch (error) {
    console.log(error)
 }
}

module.exports = authenticate