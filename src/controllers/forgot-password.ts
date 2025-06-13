import { forgetPasswordSchema } from "@authentication/schemas/forget-password.schema";
import {
  getAuthUserByEmail,
  updatePasswordToken,
} from "@authentication/services/auth.service";
import {
  BadRequestError,
  IAuthDocument,
  IEmailMessageDetails,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import crypto from "crypto";
import { config } from "@authentication/config";
import { publishDirectMessage } from "@authentication/queues/auth.producer";
import { rabbitMQChannel } from "@authentication/server";
import { StatusCodes } from "http-status-codes";

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = await Promise.resolve(
    forgetPasswordSchema.validate(req.body)
  );
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password forgotPassword() method error"
    );
  }

  const { email } = req.body;
  const existingUser: IAuthDocument | undefined = await getAuthUserByEmail(
    email
  );
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid credentials",
      "Password forgotPassword() method error"
    );
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString("hex");

  const date: Date = new Date();
  date.setHours(date.getHours() + 1);
  await updatePasswordToken(existingUser.id!, randomCharacters, date);

  const resetLink = `${config.CLIENT_URL}/reset_password?token=${randomCharacters}`;
  const messageDetails: IEmailMessageDetails = {
    receiverEmail: existingUser.email,
    resetLink,
    username: existingUser.username,
    template: "forgotPassword",
  };
  await publishDirectMessage({
    channel: rabbitMQChannel,
    exchangeName: "jobber-email-notification",
    routingKey: "auth-email",
    message: JSON.stringify(messageDetails),
    logMessage: "Forgot password message sent to notification service.",
  });
  res.status(StatusCodes.OK).json({ message: "Password reset email sent." });
}
