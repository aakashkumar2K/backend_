import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({ 
    cloud_name: 'aakashkumar0', 
    api_key: '161435316197184', 
    api_secret: '1aCorlv1T81H9TIeAm7d5VdK_7M' // Click 'View Credentials' below to copy your API secret
});
// cloudinary.config({ 
//     cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret:process.env.CLOUDINARY_API_SECRET,
// });
const uploadOnCloudinary=async(localFilePath)=>{
    try{
    if(!localFilePath) return null;
   const response=await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto",
    })
    fs.unlinkSync(localFilePath)
    return response;

}
catch(err){
    console.log(err);
    fs.unlinkSync(localFilePath);//remove the locally saved temporary file as upload operation fail
    return null;
}
}




export {uploadOnCloudinary}