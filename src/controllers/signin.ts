import { AuthModel } from "@authentication/models/auth.model";
import { signInSchema } from "@authentication/schemas/signin.schema";
import {
  getAuthUserByEmail,
  getAuthUserByUsername,
  signToken,
} from "@authentication/services/auth.service";
import {
  BadRequestError,
  IAuthDocument,
  isEmail,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { omit } from "lodash";
import { createFingerprint } from "@authentication/helpers/generateFingerprint";

export async function signIn(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(signInSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "SignIn signIn() method error"
    );
  }

  const { username, password } = req.body;
  const isValidEmail: boolean = isEmail(username);

  const existingUser: IAuthDocument | undefined = isValidEmail
    ? await getAuthUserByEmail(username)
    : await getAuthUserByUsername(username);

  if (!existingUser) {
    throw new BadRequestError(
      "Invalid credentials",
      "SignIn signIn() method error"
    );
  }

  const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(
    password,
    `${existingUser.password}`
  );
  if (!passwordsMatch) {
    throw new BadRequestError(
      "Invalid credentials",
      "SignIn read() method error"
    );
  }

  // const userAgent = req.headers["user-agent"] || "";
  const fingerprint = createFingerprint(req);

  const tokenPaylod = {
    id: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
    fingerprint,
    // userAgent: userAgent,
  };
  // const accessTokenId = uuidv4();
  const accessToken: string = signToken(
    tokenPaylod,
    `15m`
    //  accessTokenId
  );
  // const refreshTokenId = uuidv4();
  const refreshToken: string = signToken(
    tokenPaylod,
    `7d`
    // refreshTokenId
  );

  const userData = omit(existingUser, ["password"]);

  res.status(StatusCodes.OK).json({
    user: userData,
    accessToken: accessToken,
    refreshToken: refreshToken,
    message: "User signed in successfully",
    // fingerprint: fingerprint
  });
}
