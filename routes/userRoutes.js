const express=require('express');
const router=express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');

//POST Route for Signup a person
router.post('/signup', async(req,res)=>{
    try{
        const data=req.body //Assuming the request body contains the person data 

         // Check if there is already an admin user
         const adminUser = await User.findOne({ role: 'admin' });
         if (data.role === 'admin' && adminUser) {
             return res.status(400).json({ error: 'Admin user already exists' });
         }

         
          // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.adharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }


         // Check if a user with the same Aadhar Card Number already exists
         const existingUser = await User.findOne({ adharCardNumber: data.adharCardNumber });
         if (existingUser) {
             return res.status(400).json({ error: 'User with the same Aadhar Card Number already exists' });
         }

        //create a new person using Mongoose model
        const newUser=new User(data);
    
        const response=await newUser.save();
        console.log('data saved');

        const payload={
            id:response.id
        }
        console.log(JSON.stringify(payload));

        const token=generateToken(payload);
        console.log("Token is:", token);

        res.status(200).json({response:response, token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'})
    }
})

//POST Route for Login:
router.post('/login',async(req, res)=>{
    try{
        // Extract the adharCardNumber and password from request body
        const {adharCardNumber , password}=req.body

        // Check if aadharCardNumber or password is missing
         if (!adharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' });
        }
        
        //Find the user by adharCardNumber
        const user=await User.findOne({adharCardNumber:adharCardNumber});

        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username and Password'})
        }

        //Generate Token
        const payload={
            id: user.id
        }
        const token=generateToken(payload);

        //return token as reponse
        res.json({token})

    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})


//GET Route to Fetch User Profile:
router.get('/profile',jwtAuthMiddleware, async(req, res,)=>{
    try{
        const userData = req.user;
       

        const userId = req.user.userData.id;
        
        const user = await User.findById(userId);
        
        res.status(200).json({user});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})


//PUT Route to Update User Password:
router.put('/profile/password',jwtAuthMiddleware,async(req, res)=>{
    try{
        const userId = req.user; //Extract the id from token
        console.log(userId);
        const {currentPassword, newPassword} = req.body; //Extract the current and new Password from user a body

         // Check if currentPassword and newPassword are present in the request body
         if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }


        //find the user by userId
        const user = await User.findById(userId.userData.id);

        //If password doesn't match ,return error
        if(!user ||  !(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid username and Password'});
        }

        //Update user's password
        user.password=newPassword;
        await user.save();


        console.log('Password updated');
        res.status(200).json({message:"Password updated"});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})

module.exports = router;