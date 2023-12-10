const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    phoneNo:{
        type:Number,
        required:true,
        maxlength:10,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)) throw new error ('invalid email address')
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
    },
    confPassword:{
        type:String,
        required:true,
        minlength:7,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    tokens:[
        {
            token:{
                type:String,
                required:true,
            }
        }
    ],
    carts:{
     type:Array,
     default :[],
    },
},{timestamps:true,versionKey:false})

userSchema.pre('save' , async function(next){
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password,9)
        this.confPassword = await bcrypt.hash(this.password , 9)
    }
    next()
})

userSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({userId : this._id} , process.env.jwtKey);
        this.tokens = this.tokens.concat({token:token})
        await this.save()
        return token
    } catch (error) {
        console.log(error)
    }
}

userSchema.methods.cartData = async function(cart){
   try {          
this.carts = (this.carts || []).concat(cart) ;

await this.save() ;

return this.carts ;

   } catch (error) {
    console.log(error)
}
}
const User = new mongoose.model('Users' , userSchema)

module.exports = User