import {asyncHandler} from"../utils/asynchandler.js"
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser=asyncHandler(async(req,res)=>{
   const{fullName,userName,email,password}=req.body
   if([fullName,password,userName,password].some((field)=>
     field?.trim()===""
   )){
    throw new ApiError(400,"all fiels are required");
   }
   const existedUser=User.findOne({
    $or:[{email},{userName}]
   })
   if(existedUser){
    throw new ApiError(400,'user already exists')
   }
   const avatarLocalPath=req.files?.avatar[0].path;
   const coverImageLocalPath=req.files?.coverImage[0].path;
if(!avatarLocalPath){
 throw new ApiError(400,'Avatar file is required');
}
const avtar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalPath);
if(!avtar){
    throw new ApiError(500,'erroe in uploading');
}
const user=User.create({
    userName:userName.toLowerCase(),
    fullName,
    avatar:avtar.url,
    coverImage:coverImage?.url||"",
    email,
    password

})
const user1=await User.findById(user._id).select(-password -refreshToken);
if(user1){
    throw new ApiError(500,'something went wrong while registring the user');
}
return res.status(200).json(
new ApiResponse(200,user1,'user registered successfully')
)
})
export {registerUser}