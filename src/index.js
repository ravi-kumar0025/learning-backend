// require('dotenv').config({path:'./env'})

import dotenv from 'dotenv'
import  mongoose from 'mongoose'
import {DB_NAME} from './constants.js'
import express from 'express'
const app=express();

dotenv.config({
    path:'./env'
})
import connectDB from './db/index.js'

connectDB()
.then(()=>{
    app.listen( process.env.PORT || 8000),()=>{
        // console.log("database successfully connected 👌👌")
        console.log(`currently working at port ${process.env.PORT}`)
    }

})
.catch((err)=>{
    console.log("error in connecting the database ⚠️ ⚠️ ",err);
    process.exit(1);
})

// import express from 'express'
// const app=express();

// (async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

//         app.on("error",(error)=>{
//             console.log("Error: ",error);
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     }catch(error){
//         console.error("ERROR: ",error)
//         throw error
//     }
// })()