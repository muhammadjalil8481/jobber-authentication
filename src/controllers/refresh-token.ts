import { config } from "@authentication/config";
import {
  getAuthUserByEmail,
  signToken,
} from "@authentication/services/auth.service";
import {
  IAuthDocument,
  IAuthPayload,
  NotAuthorizedError,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { verify } from "jsonwebtoken";
import { omit } from "lodash";

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.headers["x-refresh-token"] as string;
  if (!refreshToken) {
    throw new NotAuthorizedError(
      "Unauthorized.",
      "Gateway Service refreshToken() method"
    );
  }

  const payload: IAuthPayload = verify(
    refreshToken,
    config.JWT_TOKEN_SECRET
  ) as IAuthPayload;

  const { email } = payload;
  if (!email) {
    throw new NotAuthorizedError(
      "Unauthorized.",
      "Gateway Service refreshToken() method"
    );
  }

  const existingUser: IAuthDocument | undefined = await getAuthUserByEmail(
    email
  );

  if (!existingUser) {
    throw new NotAuthorizedError(
      "Unauthorized.",
      "Gateway Service refreshToken() method"
    );
  }

  const tokenPaylod = {
    id: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
  };

  const newAccessToken: string = signToken(tokenPaylod, `15m`);
  const newRefreshToken: string = signToken(tokenPaylod, `7d`);
  const userData = omit(existingUser, ["password"]);

  res.status(StatusCodes.OK).json({
    user: userData,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    message: "User signed in successfully",
  });
}
