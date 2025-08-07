import mongoose from "mongoose";    
import {DB_NAME} from "../constants.js"

const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongodb connected !! ${connectionInstance.connection.host}`)
    }catch(error){
        console.error("ERROR IN THE INDEX.JS FILE OF DB: ",error);
        console.log("🔍 Mongo URI:", process.env.MONGODB_URI);
        process.exit(1)
    }
}

export default connectDB