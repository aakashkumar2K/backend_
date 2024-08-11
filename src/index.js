import dotenv from 'dotenv';
import connectionDB from './db/index.js';
import {app} from './app.js'
dotenv.config({
    path:"./a.env"
}
)
connectionDB()
.then(()=>{
    app.listen(`${process.env.PORT}`,()=>{
        console.log(`server started sucessfully,${process.env.PORT}`);
    })
    app.on('error',(err)=>{
        console.log(err);
        throw err;
    })
})
.catch((err)=>{
    console.log("MONGO DB connection fail",err);
})