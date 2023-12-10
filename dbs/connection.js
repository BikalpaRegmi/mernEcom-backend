const mongoose = require('mongoose');

mongoose.connect(process.env.URL).then(()=>{
    console.log('dbs connected sucessfully')
}).catch((err)=>{
   console.log('the error is' , err)
}) 

module.exports = mongoose ;  