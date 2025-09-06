import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.models.js";

export const verify_jwt=asyncHandler(async (req,res,next)=>{
    
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token)
            throw new ApiError(401,"Unauthorized token")
        
        // to decode the token
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user= await User.findById(decoded._id).select("-password -refreshToken")

        if(!user)
            throw new ApiError(401,"Not a valid user\n")
    
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401, error || "Invalid ACCESS TOKEN")
    }
})