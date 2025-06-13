import {
  getAuthUserById,
  getAuthUserByVerificationToken,
  updateVerifyEmailField,
} from "@authentication/services/auth.service";
import {
  BadRequestError,
  IAuthDocument,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export async function verifyUser(req: Request, res: Response): Promise<void> {
  const { token } = req.body;
  const checkIfUserExist: IAuthDocument | undefined =
    await getAuthUserByVerificationToken(token);

  if (!checkIfUserExist) {
    throw new BadRequestError(
      "Verification token is either invalid or is already used.",
      "VerifyEmail verifyUser() method error"
    );
  }

  await updateVerifyEmailField(checkIfUserExist.id!, 1, "");

  const updatedUser = await getAuthUserById(checkIfUserExist.id!);

  res
    .status(StatusCodes.OK)
    .json({ message: "Email verified successfully.", data: updatedUser });
}
