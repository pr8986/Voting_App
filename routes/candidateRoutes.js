const express=require('express');
const router=express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');
const Candidate = require('../models/candidate');


const checkAdminRole = async (userID) =>{
    try{
        const user = await User.findById(userID);
        console.log(user)
        if(user.role === 'admin')
        {
            return true;
        }
        //return false;
    }catch(err){
        return false;
    }
}


//POST route to add candidate
router.post('/',jwtAuthMiddleware, async(req,res)=>{
    try{
        if(!(await checkAdminRole(req.user.userData.id))){
            return res.status(403).json({message:'user does not have  admin role'});
        }
        

        const data=req.body //Assuming the request body contains the person data 

        //create a new person using Mongoose model
        const newCandidate=new Candidate(data);
    
        const response=await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response:response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'})
    }
})



//PUT Route to Update a Candidate:
router.put('/:candidateID',jwtAuthMiddleware,async(req, res)=>{
    try{
        if(!(await checkAdminRole(req.user.userData.id)))
            return res.status(403).json({message:'user do not have  admin role'});


        const candidateID = req.params.candidateID; //Extract the id from Url parameter
        const updateCandidateData = req.body; //update the data for one person

        const response=await Candidate.findByIdAndUpdate(candidateID,updateCandidateData,{
            new :true, //Return the updated document 
            validator:true // Return  mongoose validation
        })
        
        if(!response)
        {
            return res.status(404).json({error:'candidate not found'});
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})


//DELETE Route to Remove a Candidate:
router.delete('/:candidateID',jwtAuthMiddleware,async(req, res)=>{
    try{
        if(!(await checkAdminRole(req.user.userData.id)))
            return res.status(403).json({message:'user do not have  admin role'});

        const candidateID = req.params.candidateID; //Extract the id from Url parameter
        

        const response=await Candidate.findByIdAndDelete(candidateID);
        
        if(!response)
        {
            return res.status(404).json({error:'candidate not found'});
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})


//POST Route to Cast a Vote:
//let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware,async (req, res)=>{
    //no admin can vote
    //user can only votes

   const candidateID = req.params.candidateID;
   const userId = req.user.userData.id; 
    try{
            //find the candidate document with specified candidateID
            const candidate=await Candidate.findById(candidateID);
            if(!candidate){
                return res.status(404).json({message:'candidate not found'});
            }


            const user = await User.findById(userId);
            if(!user)
            {
                return res.status(404).json({message:'user not found'});
            }

            
            if(user.role == 'admin'){
                return res.status(403).json({message:'admin is not allowed'});
            }

            if(user.isVoted){
                return res.status(400).json({messge:'user have already voted'});
            }

            //update the candiadte document to record the vote
            candidate.votes.push({user:userId});
            candidate.voteCount++;
            await candidate.save();


            //Update the user document
            user.isVoted = true;
            await user.save();

            res.status(200).json({message:'voted recorded successfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})


//GET Route to Display Vote Count for Each Candidate:
//Vote count
router.get('/vote/count', async(req, res)=>{
    try{
        //find all candidate and sort them by voteCount in descending order
        const candidate= await Candidate.find().sort({voteCount:'desc'});

        //Map the candidate to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err)
    {
        console.log(err);
        res.status(500).json({message:'Internal Server Error'});
    }
})



//GET Route to List All Candidates:
router.get('/allcandidate', async(req,res )=>{
    try{
        //find all candidates and select only the name and party field,excluding _id
        const candidate = await Candidate.find({}, 'name party -_id');

        //return the list of candidate
        res.status(200).json(candidate);
    }catch(err){
        console.log(err);
        res.status(500).json({message:'Internal Server Error'})
    }
})

module.exports = router;