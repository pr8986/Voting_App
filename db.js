const mongoose=require('mongoose');
require('dotenv').config();

//define mongoDB connection URL
const mongoURL=process.env.MONGODB_URL_LOCAL      //hotels is database we created here
//const mongoURL=process.env.MONGODB_URL;

//Set Up mongoDB connections
mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})


//get the default connection
//mongoose maintains a default connection object representing the mongoDB connection
const db=mongoose.connection;


//define the Event Listener for database connections
db.on('connected',()=>{
    console.log('connected to mongoDB server');
});

db.on('error',(err)=>{
    console.log('MongoDB connection error',err);
});

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
});

//Export the database connections
module.exports = db;
