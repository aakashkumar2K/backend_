import mongoose from 'mongoose';
import {DB} from '../constant.js';
 
const connectionDB=async()=>{
    try{
     const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB}`);
     console.log(`mongodbconnected succesffully: ${connectionInstance}`)
    }
    catch(err){
        console.log(`${process.env.MONGODBURL}`,err);
    }
}
 export  default  connectionDB;