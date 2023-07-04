require('dotenv').config()
require('./database/database').connect()
const express=require('express')
import Users from './models/users'
const app=express()
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("<h1>Server is Working!</h1>")
})

app.post('/register',async (req,res)=>{
    try{
        //get all data from the body.
        //we will be checking if the user already exists
        //encrypting password
        //save the user in DB
        //generating token for the user and then send it
        //in the login, we have to store these token in the cookie of the user
        //and the best way to get this is to send the sevrer side cookies right

        const {firstName,lastName,email,password}=req.body
        


    }
    catch(error){
        res.json({"error":"Something wrong Occured!"})
    }

})

module.exports=app