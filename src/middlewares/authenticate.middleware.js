import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js"
import { User } from "../models/user.model.js";

 const verifyJwt=asyncHandler(async(req,_,next)=>{
    try {
        if(!(req.cookies.length>0)){
            throw new ApiError(400,"user is not logged in")
        }
        const accessToken=req.cookies?.AccessToken||req.header("Authorization")?.replace("Bearer ","");
        if(!accessToken){
            throw new ApiError(400,"user is not logged in")
        }
        const decodedToken=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
         if(!decodedToken){
            throw new ApiError("something went wrong ")
         }
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(400,"unauthoriezed user");
        }
        req.user=user;
        next()
    
    } catch (error) {
        throw new ApiError(500,"unauthorized user as token");
        
    }
})
export {verifyJwt}