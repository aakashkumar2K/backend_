import mongoose from "mongoose";
import bcryptjs  from "bcryptjs";
import  JsonWebToken from "jsonwebtoken";
const userSchema=new mongoose.Schema({
userName:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true
 },
 email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
 }, 
 fullName:{
    type:String,
    required:true,
    trim:true,
    index:true
 },
 avtar:{
    type:String,//cloudinary url
    required:true,

 },
 coverImage:{
    type:String //cloudinary url
 },
 watchHistory:[{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Video"
 }],
 password:{
    type:String,
    required:[true,'Password is required']
 },
refreshToken:{
    type:String
}

},{timeStamps:true});

userSchema.pre('save',async function(next){
   if(!this.isModified(this.password)) return null;
   this.password=await bcryptjs.hash(this.password,10);
   next();
})
userSchema.methods.generateAccessToken=(function(){
   JsonWebToken.sign({
      id:this.id,
      email:this.email,
      userName:this.userName,
      fullName:this.fullName
   },
   process.env.ACCESS_TOKEN_SECRET,
   {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
})
userSchema.methods.generateRefreshToken=(function(){
   JsonWebToken.sign({
      id:this.id,
   },
   process.env.REFRESH_TOKEN_SECRET,
   {expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
})

userSchema.methods.isPasswordCorrect=async function(password){
return bcryptjs.compare(passowrd,this.passowrd);
}
export const User=mongoose.model("User",userSchema);