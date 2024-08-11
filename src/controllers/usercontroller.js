import {asyncHandler} from"../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//import { jwt } from "jsonwebtoken";

// const generateAccessAndRefereshTokens = async(userId) =>{
//     try {
//         const user = await User.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()

//         user.refreshToken = refreshToken
//         await user.save({ validateBeforeSave: false })

//         return {accessToken, refreshToken}


//     } catch (error) {
//         throw new ApiError(500, "Something went wrong while generating referesh and access token")
//     }
// }

const registerUser=asyncHandler(async(req,res)=>{
   const{fullName,userName,email,password}=req.body
   if([fullName,password,userName,password].some((field)=>
     field?.trim()===""
   )){
    throw new ApiError(400,"all fiels are required");
   }
   const existedUser=await User.findOne({
    $or:[{email},{userName}]
   })
   if(existedUser){
    throw new ApiError(400,'user already exists')
   }
   const avatarLocalPath=req.files?.avatar[0].path;
   //const coverImageLocalPath=req.files?.coverImage[0].path;
   let coverImageLocalPath
   if(req.files&& Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath=req.files.coverImage[0].path
   }

if(!avatarLocalPath){
 throw new ApiError(400,'Avatar file is required');
}
const avtar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath);
if(!avtar){
    throw new ApiError(500,'erroR in uploading');
}
const user=await User.create({
    userName:userName.toLowerCase(),
    fullName,
    avatar:avtar.url,
    coverImage:coverImage?.url||"",
    email,
    password

})
//const createduser= await User.findById(user._id).select("-password");
 const createduser = await (User.find(user._id).select(
    "-password -refreshToken"
))
if(!createduser){
    throw new ApiError(500,'something went wrong while registring the user');
}
return res.status(200).json(
new ApiResponse(200,createduser,'user registered successfully')
)
})
export {registerUser}