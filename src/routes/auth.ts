import { forgotPassword } from "@authentication/controllers/forgot-password";
import { signIn } from "@authentication/controllers/signin";
import { create } from "@authentication/controllers/signup";
import { verifyUser } from "@authentication/controllers/verify-email";
import { Router } from "express";

const router: Router = Router();

router.post("/signup", create);
router.post("/sigin", signIn);
router.patch("/verify-email", verifyUser);
router.patch("/forget-password", forgotPassword);

export { router };
