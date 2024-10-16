const express=require('express');
const app=express();
const db=require('./db');
require('dotenv').config();
const cors = require('cors')

const bodyParser=require('body-parser');
app.use(bodyParser.json()); //req.body
app.use(cors({
  origin: "*",
  methods :['GET','PUT','POST','DELETE'],
  credentials: true
}));
const PORT=process.env.PORT || 3001;

//const {jwtAuthMiddleware}=require('./jwt');

app.get('/',async function(req,res) {
  res.json("Hello from voting app backend");
})

//Import the router file
const userRoutes=require('./routes/userRoutes');
const candidateRoutes=require('./routes/candidateRoutes');

//Use the routers
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);

app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
})