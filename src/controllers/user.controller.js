import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";        //this is created using the mongodb so it can interact with mongodb


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



export {
    registerUser
}