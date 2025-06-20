import { getCurrentUser } from "@authentication/controllers/current-user";
import {
  changePassword,
  forgotPassword,
  resetPassword,
} from "@authentication/controllers/password";
import { refreshToken } from "@authentication/controllers/refresh-token";
import { resendVerificationEmail } from "@authentication/controllers/resend-verefication-email";
import { signIn } from "@authentication/controllers/signin";
import { create } from "@authentication/controllers/signup";
import { verifyUser } from "@authentication/controllers/verify-email";
import { checkAuthentication } from "@muhammadjalil8481/jobber-shared";
import { Router } from "express";

const router: Router = Router();

router.post("/api/v1/signup", create);
router.post("/api/v1/signin", signIn);
router.get("/api/v1/current-user", checkAuthentication, getCurrentUser);
router.patch("/api/v1/verify-email", verifyUser);
router.patch("/api/v1/forget-password", forgotPassword);
router.patch("/api/v1/reset-password", resetPassword);
router.patch("/api/v1/change-password", changePassword);
router.post(
  "/api/v1/resend-verification-email",
  checkAuthentication,
  resendVerificationEmail
);
router.post("/api/v1/refresh-token", refreshToken);

export { router as authRouter };
