const express = require('express');
const router = require('./Router/userRoute.js');
const router1 = require('./Router/productRoute.js')
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
require('dotenv').config()
const port = process.env.PORT || 3003
require('./dbs/connection.js')



app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin: ['http://localhost:5173','http://192.168.1.69:5173', process.env.client ],
    credentials: true,
  }));

  app.use(router) 

  app.use(router1)

  app.use(express.static('public'))


  

app.get('/',(req,res)=>res.send('connected'))

app.listen(port ,'0.0.0.0', (err)=>console.log('server listening to' , port))