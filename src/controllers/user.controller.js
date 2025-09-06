import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";        //this is created using the mongodb so it can interact with mongodb
import { userInfo } from "os";
import { triggerAsyncId } from "async_hooks";
import { log } from "console";
import jwt from "jsonwebtoken"

const generateRefeshAccessToken = async (userId)=>{
    try {
        const user= await User.findOne({ _id: userId })
        console.log(user)

        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken=refreshToken

        await user.save({validateBeforeSave: false})

        return {refreshToken,accessToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong from server side please login again") 
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "done at last after 2 days of debugging"
    // })

    //get user details from frontend
    // validation - not empty
    // check if user already exists
    // check for images ,avatar
    // upload them to cloudinary
    // create user object
    // remove password and refresh token from response
    // check for user creation
    // return response


    const { email, fullName ,password} = req.body
    // console.log("email: ", email);
    // console.log("fullName: ", fullName);
    // console.log("password: ",password);
    const input=[fullName,email,password];
    if(
        input.some((para)=>{
            para?.trim()===""
        })
    ){
        throw new ApiError(400,"Give all the parameters");
    }
    const existedUser = await User.findOne({
        $or :[{ fullName },{ email },]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or fullName alredy exists");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(req.files)
    console.log(avatar)
    console.log(req.body)
    console.log(coverImage)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    const newUser = await User.create({fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        fullName:fullName.toLowerCase()
    })

    const newUserCreated= User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if(!newUserCreated){
        throw new ApiError(500,"Server could not register the user please try again later"
        )
    }

    return res.status(201).json(
        new ApiResponse(200, newUserCreated.toJSON, "User registered successfully")
        
    )
})

// const loginUser=asyncHandler(async(req,res)=>{
//     console.log("check check======")
//     console.log(req.body)
//     res.send("Hello Ravi Kumar")
// })

const loginUser = asyncHandler(async(req,res,next)=>{
    // req body ->data
    // username or email
    // find the user
    // password check
    // access or refresh token
    // send cookies
    console.log("req.email->",req.body)
    const {email,password}=req.body

    if(!email){
        res.status(401).send("Please enter your email")
    }
    // if(!email){
        // throw new ApiError(400,"Email is not correct")
    // }

    const userInDatabse=await User.findOne({
        $or:[{email}]
    })

    if(!userInDatabse){
        throw new ApiError(400,"Please sign up this account doe not exist")
    }

    const passwordCorrect=await userInDatabse.isPasswordCorrect(password)

    if(!passwordCorrect)
        throw ApiError(400,"Password given is incorrect,please check it again")

    const {accessToken,refreshToken} = await generateRefeshAccessToken(userInDatabse._id)

    const loggedInUser = await User.findById(userInDatabse._id).select("-password -avatar -coverImage -refreshToken")

    const options ={
        // till now cookies can be modified by frontend
        httpOnly: true,
        secure: true    
        // now the cookies are only modifiable by the server
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,refreshToken, accessToken
            },
            "You can access the web now"
        )
    )

})

const logOutuser= asyncHandler(async(req, res)=>{
    const id=req.user._id

    await User.findByIdAndUpdate(
        id,{
            $set:{
                refreshToken: undefined
            }
        },{
            new: true //updated user return
        }
    )

    const options ={
        httpOnly: true,
        secure: true  
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refeshToken",options)
    .json(new ApiResponse(200,{},"Log out done successfully\n"))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{

    const incomingRefreshToken = req.cookies.refreshToken ||
    req.body.refreshToken

    if(!incomingRefreshToken)
        throw new ApiError(401,"unauthorized access")

    try {
        
            const token=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        
            const user = await User.findById(token?._id)
        
            if(!user)
                throw new ApiError(401,"Invalid refesh Token")
            
            if(incomingRefreshToken!==user.refreshToken)
                throw new ApiError(401,"refresh token expired")
        
            const options ={
                httpOnly: true,
                secure: true  
            }
        
            const {newaccessToken,newrefreshToken}=generateRefeshAccessToken(user._id)
        
            return res
            .status(200)
            .cookie("accessToken",newaccessToken,options)
            .cookie("refreshToken",newrefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {newaccessToken,refreshToken:newrefreshToken},
                    "New access token generated successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401,"Invalid token")
    }

})

export {
    registerUser,
    loginUser,
    logOutuser,
    refreshAccessToken
}

