import {
  getAuthUserByEmail,
  getAuthUserById,
  updateVerifyEmailField,
} from "@authentication/services/auth.service";
import {
  BadRequestError,
  IAuthDocument,
  IEmailMessageDetails,
  lowerCase,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import crypto from "crypto";
import { config } from "@authentication/config";
import { publishDirectMessage } from "@authentication/queues/auth.producer";
import { rabbitMQChannel } from "@authentication/server";
import { StatusCodes } from "http-status-codes";

export async function resendVerificationEmail(req: Request, res: Response): Promise<void> {
  const { email, userId } = req.body;
  const checkIfUserExist: IAuthDocument | undefined = await getAuthUserByEmail(
    email
  );
  if (!checkIfUserExist) {
    throw new BadRequestError(
      "Email is invalid",
      "CurrentUser resentEmail() method error"
    );
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString("hex");
  const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${randomCharacters}`;
  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: "verifyEmail",
  };
  await publishDirectMessage({
    channel: rabbitMQChannel,
    exchangeName: "jobber-email-notification",
    routingKey: "auth-email",
    message: JSON.stringify(messageDetails),
    logMessage: "Verify email message has been sent to notification service.",
  });
  const updatedUser = await getAuthUserById(parseInt(userId));
  res
    .status(StatusCodes.OK)
    .json({ message: "Email verification sent", user: updatedUser });
}
