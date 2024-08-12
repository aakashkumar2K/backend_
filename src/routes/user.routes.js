import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser,login,logout } from "../controllers/usercontroller.js";
import { verifyJwt } from "../middlewares/authenticate.middleware.js";
const router=Router();
router.route("/register").post(upload.fields([
{
name:"avatar",
maxCount:1
},
{
name:"coverImage",
maxCount:1

}]),registerUser)
router.route("/login").post(login);
router.route("/logout").post(verifyJwt,logout);
export default router;
