import { Router } from "express";
import { loginUser, logOutuser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
const router =Router();

import { upload } from "../middlewares/multer.middleware.js";
import { verify_jwt } from "../middlewares/auth.middleware.js" 

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1,
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verify_jwt,logOutuser)

router.route("/refresh-token").post(refreshAccessToken)

export default router