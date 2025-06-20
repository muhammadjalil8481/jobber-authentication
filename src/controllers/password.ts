import { forgetPasswordSchema } from "@authentication/schemas/forget-password.schema";
import {
  getAuthUserByPasswordToken,
  getAuthUserByUsername,
  getAuthUserByUsernameOrEmail,
  updatePassword,
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
import { resetPasswordSchema } from "@authentication/schemas/resetPasswordSchema";
import { AuthModel } from "@authentication/models/auth.model";
import { changePasswordSchema } from "@authentication/schemas/change-password.schema";

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

  const { username } = req.body;
  const existingUser: IAuthDocument | undefined =
    await getAuthUserByUsernameOrEmail(username, username);
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

export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = await Promise.resolve(
    resetPasswordSchema.validate(req.body)
  );
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password resetPassword() method error"
    );
  }

  const { newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    throw new BadRequestError(
      "Passwords do not match",
      "Password resetPassword() method error"
    );
  }

  const { token } = req.query;
  const existingUser: IAuthDocument | undefined =
    await getAuthUserByPasswordToken(token as string);
  if (!existingUser) {
    throw new BadRequestError(
      "Reset token has expired",
      "Password resetPassword() method error"
    );
  }

  const compareWithCurrentPassword = await AuthModel.prototype.comparePassword(
    newPassword,
    existingUser.password!
  );
  
  if(compareWithCurrentPassword){
    throw new BadRequestError(
      "New password cannot be the same as the current password",
      "Password resetPassword() method error"
    );
  }

  const hashedPassword: string = await AuthModel.prototype.hashPassword(
    newPassword
  );
  await updatePassword(existingUser.id!, hashedPassword);
  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: "resetPasswordSuccess",
  };

  await publishDirectMessage({
    channel: rabbitMQChannel,
    exchangeName: "jobber-email-notification",
    routingKey: "auth-email",
    message: JSON.stringify(messageDetails),
    logMessage: "Reset password success message sent to notification service.",
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Password successfully updated." });
}

export async function changePassword(
  req: Request,
  res: Response
): Promise<void> {
  const { error } = await Promise.resolve(
    changePasswordSchema.validate(req.body)
  );
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      "Password changePassword() method error"
    );
  }
  const { currentPassword,newPassword } = req.body;

  const existingUser: IAuthDocument | undefined = await getAuthUserByUsername(
    `${req.currentUser?.username}`
  );
  if (!existingUser) {
    throw new BadRequestError(
      "Invalid password",
      "Password changePassword() method error"
    );
  }

  const currentPasswordMatch = await AuthModel.prototype.comparePassword(
    currentPassword,
    existingUser.password!
  );

  if (!currentPasswordMatch) {
    throw new BadRequestError(
      "Invalid password",
      "Password changePassword() method error"
    );
  }

  const hashedPassword: string = await AuthModel.prototype.hashPassword(
    newPassword
  );
  await updatePassword(existingUser.id!, hashedPassword);

  const messageDetails: IEmailMessageDetails = {
    username: existingUser.username,
    template: "resetPasswordSuccess",
  };
  await publishDirectMessage({
    channel: rabbitMQChannel,
    exchangeName: "jobber-email-notification",
    routingKey: "auth-email",
    message: JSON.stringify(messageDetails),
    logMessage: "Reset password success message sent to notification service.",
  });

  res
    .status(StatusCodes.OK)
    .json({ message: "Password successfully updated." });
}
