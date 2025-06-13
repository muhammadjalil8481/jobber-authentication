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

export async function signIn(req: Request, res: Response): Promise<void> {
  const { error } = await Promise.resolve(signInSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "SignIn signIn() method error"
    );
  }

  const { username, password, browserName, deviceType } = req.body;
  const isValidEmail: boolean = isEmail(username);

  const existingUser: IAuthDocument | undefined = !isValidEmail
    ? await getAuthUserByUsername(username)
    : await getAuthUserByEmail(username);

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

  const userJWT: string = signToken(
    existingUser.id!,
    existingUser.email!,
    existingUser.username!
  );
  const userData = omit(existingUser, ["password"]);

  res.status(StatusCodes.OK).json({
    user: userData,
    token: userJWT,
  });
}
