import { asyncHandler } from "../utils/asynchandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteOnCloudinary } from "../utils/deleteCloudionary.js";
//import  jwt  from "jsonwebtoken";
//import { verifyJwt } from "../middlewares/authenticate.middleware.js";
const generateAccessAndRefereshTokens = async (user_id) => {
    try {
        const user = await User.findById(user_id);

        const accessToken = user.generateAccessToken();
        // console.log(accessToken);
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave: false
        })
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "someThing went wrong while generating token");
    }

}

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

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email, password } = req.body
    if ([fullName, password, userName, password].some((field) =>
        field?.trim() === ""
    )) {
        throw new ApiError(400, "all fiels are required");
    }
    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (existedUser) {
        throw new ApiError(400, 'user already exists')
    }
    const avatarLocalPath = req.files?.avatar[0].path;
    //const coverImageLocalPath=req.files?.coverImage[0].path;
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar file is required');
    }
    const avtar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avtar) {
        throw new ApiError(500, 'erroR in uploading');
    }
    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        avatar: avtar.url,
        coverImage: coverImage?.url || "",
        email,
        password

    })
    //const createduser= await User.findById(user._id).select("-password");
    const createduser = await (User.find(user._id).select(
        "-password -refreshToken"
    ))
    if (!createduser) {
        throw new ApiError(500, 'something went wrong while registring the user');
    }
    return res.status(200).json(
        new ApiResponse(200, createduser, 'user registered successfully')
    )
})



const login = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;

    if (!email && !userName) {
        throw new ApiError(400, "email or username required")
    }
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(401, "user does not exist")
    }
    if (!user.isPasswordCorrect(password)) {
        throw new ApiError(400, "error wrong password");
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
    const logged_User = await User.findById(user._id).select("-password -refreshToken")
    return res.status(200).cookie("AccessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, logged_User, "user logged in successfully")
        )
})


const logout = asyncHandler(async (req, res) => {
    const user = User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }
    }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("AccessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        )

})
const changePassword = asyncHandler(async (req, res) => {
    const { password, oldPassword } = req.body
    if (!(password && oldPassword))
        throw new ApiError(400, "password and old password cannot be empty");

    const user = await findById(req.user?._id);
    const validate = await user.isPasswordCorrect(oldPassword);
    if (!validate) {
        throw new ApiError(401, 'old passowrd is not correct')
    }
    user.password = password;
    user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, {}, "password changed successfully")
    )

})
const refreshAccessToken = asyncHandler(async () => {
    const { currentRefreshToken } = req.cookies?.refreshToken || req.body?.refreshToken
    if (!currentRefreshToken) {
        throw new ApiError(400, 'Inavlid user');
    }
    const decodedToken = await jwt.verify(currentRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = User.findById(decodedToken?._id).select("-password -refreshToken")
    if (!(user.refreshToken === currentrefreshToken)) {
        throw new ApiError(400, "tokens mismathch");

    }
    const { newAccessToken, newRefreshToken } = generateAccessAndRefereshTokens(user._id);
    user.refreshToken = newRefreshToken;
    user.save(
        { validateBeforeSave: false }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookies("AcessToken", newAccessToken, options)
        .cookies("refreshToken", newRefreshToken, options).json(new ApiResponse(200, user, "AcessTokenRefreshed"))

})

const updateUser = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!(fullName && email)) {
        throw new ApiError(400, 'all fields required')
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            fullName,
            email: email
        }
    }, {
        new: true
    }
    ).select("-passowrd -refreshToken")
    if (!user) {
        throw new ApiError(400, "user not found")
    }
    return res.status(200).json(
        new ApiResponse(200, user, "details updated sucessfully")
    )
})
const updateAvatar = asyncHandler(async (req, res) => {
    const { localpath } = req.file?.avatar;
    if (!localPath) {
        throw new ApiError(400, 'image cannnot be empty');
    }
    const cloudianry = uploadOnCloudinary(localpath);
    const user = req.user;
    const oldcloudurl = user.avatar;

    deleteOnCloudinary(oldcloudurl);

    user.avatar = cloudianry.url;
    user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, {}, "avatar changed successfully")
    )

})
const updateCoverImage = asyncHandler(async (req, res) => {
    const { localpath } = req.file?.coverImage;
    if (!localpath) {
        throw new ApiError(400, 'image cannnot be empty');
    }
    const cloudianry = uploadOnCloudinary(localpath);
    const user = req.user;
    const oldcloudurl = user.coverImage;
    if (oldcloudurl)
        deleteOnCloudinary(oldcloudurl);

    user.coverImage = cloudianry.url;
    user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, {}, "coverImage  changed successfully")
    )

})

const getUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(
        new ApiResponse(200, user, "user details fetched successfully ")
    )
})
export {
    registerUser,
    login,
    generateAccessAndRefereshTokens,
    logout,
    changePassword,
    refreshAccessToken,
    updateUser,
    updateAvatar,
    updateCoverImage,
    getUser
}