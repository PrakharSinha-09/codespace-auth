require('dotenv').config()
require('./database/database').connect()
const express=require('express')
const Users =require('./models/users')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser')
const {JWT_SECRET}=process.env

const app=express()
app.use(express.json())
app.use(cookieParser())              //cookie parser is basically a middleware use to understand and also to interact with them

app.get('/',(req,res)=>{
    res.send("<h1>Server is Working!</h1>")
})

app.post('/register',async (req,res)=>{
    try{
        //get all data from the body.
        const {firstName,lastName,email,password}=req.body

        if(!(firstName && lastName && email && password)){
            res.status(400).send('All Fields Are Compulsory!')
        }
       
        //checking if user already exist!
        const existingUser=await Users.findOne({email})
        
        if(existingUser){
            res.status(401).send('User Already Exist!')
        }

        //encrypting password
        const encryptedPwd=await bcrypt.hash(password,10,)

        //save the user in DB
        const user=await Users.create({
            firstName:firstName,
            lastName:lastName,
            email:email,
            password:encryptedPwd  
        })

        //generating token for the user and then send it
        const token=jwt.sign(
            {id:user._id,email:user.email},
            JWT_SECRET,
            {
                expiresIn:"2h"
            }
        )

        //Just Appending The generated token in the token attribute of our schema
        user.token=token
        user.password=undefined     //we don't want to send password to the front-end, but don't confuse yourself like will it be storing password in the DB.. Yes It Will, because we have encryptedPwd in DB and not this pwd

        //Now Sending all the user info as response, so that it can be used by the front end
        res.status(201).json(user)

        //in the login, we have to store these token in the cookie of the user
        //and the best way to get this is to send the sevrer side cookies right

    }
    catch(error){
        res.json({"error":"Something wrong Occured!"})
    }

})

app.post('/login',async(req,res)=>{
    try{
        //get all data from the front-end
        const {email,password}=req.body

        if(!(email && password)){
            res.status(400).json({'error':"Some fields are missing"})
        }

        //finding user in DB
        const user=await User.findOne({email})

        if(!user){
            res.status(400).json({'error':"User Doesn't Exist"})
        }

        //if user exist and password got matched.. we wanna generate token.
        if(user && (await bcrypt.compare(password,user.password))){
            const token=jwt.sign(
                {id:user._id},JWT_SECRET,
                {
                    expiresIn:'2h'
                }
            )
            user.token=token
            user.password=undefined

            //sending a token in the cookie
            //cookie section
            const options={
                expires:new Date(Date.now()+3 * 24 * 60 * 60 * 1000),        //for 3 days and converting in the smallest unit, here i have considerred in the milliseconds
                httpOnly:true            //this will ensure that cookies are secure means only server can manipulate the cookie, user just by inspecting cannot
            }

            //setting up the cookie, name of cookie is token and it has value token... other things like options are also sent
            res.status(200).cookie("token",token,options).json({
                success:true,
                token,
            })

        }

    }
    catch(error){
        console.log(error);
    }
})

module.exports=app