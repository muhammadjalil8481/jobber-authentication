import { getAuthUserById } from "@authentication/services/auth.service";
import { IAuthDocument } from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  let user = null;
  const existingUser: IAuthDocument | undefined = await getAuthUserById(
    req.currentUser!.id
  );
  if (Object.keys(existingUser!).length) {
    user = existingUser;
  }
  res.status(StatusCodes.OK).json({ message: "Authenticated user", user });
}
