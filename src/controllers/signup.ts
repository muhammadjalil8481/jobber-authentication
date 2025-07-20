import { signupSchema } from "@authentication/schemas/signup.schema";
import {
  createAuthUser,
  getAuthUserByUsernameOrEmail,
} from "@authentication/services/auth.service";
import {
  BadRequestError,
  firstLetterUppercase,
  lowerCase,
  IAuthDocument,
  uploads,
  IEmailMessageDetails,
} from "@muhammadjalil8481/jobber-shared";
import { UploadApiResponse } from "cloudinary";
import { Request, Response } from "express";
import { v4 as uuidV4 } from "uuid";
import crypto from "crypto";
import { config } from "@authentication/config";
import { publishDirectMessage } from "@authentication/queues/auth.producer";
import { rabbitMQChannel } from "@authentication/server";
import { StatusCodes } from "http-status-codes";
import { sequelize } from "@authentication/database/database";

export async function create(req: Request, res: Response): Promise<void> {
  const transaction = await sequelize.transaction();
  try {
    // Validate request body against the signup schema
    const { error } = signupSchema.validate(req.body);
    if (error?.details) {
      throw new BadRequestError(
        error.details[0].message,
        "SignUp create() method error"
      );
    }

    const { username, email, password, country, profilePicture } = req.body;

    // Check if user already exists by username or email
    const checkIfUserExist: IAuthDocument | undefined =
      await getAuthUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError(
        "Invalid credentials. Email or Username already exists.",
        "SignUp create() method error"
      );
    }

    // Generate a unique public ID for cloudinary for the profile picture and upload it to cloudinary
    const profilePublicId = uuidV4();
    const uploadResult: UploadApiResponse = (await uploads(
      profilePicture,
      `${profilePublicId}`,
      true,
      true
    )) as UploadApiResponse;

    if (!uploadResult.public_id) {
      throw new BadRequestError(
        "File upload error. Try again",
        "SignUp create() method error"
      );
    }

    // Generate a 20 character random string for verifiction token and convert it to hexa decimal
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString("hex");

    // Create auth data object and create auth user in the database
    const authData: IAuthDocument = {
      username: firstLetterUppercase(username),
      email: lowerCase(email),
      profilePublicId,
      password,
      country,
      profilePicture: uploadResult?.secure_url,
      emailVerificationToken: randomCharacters,
    } as IAuthDocument;

    const result: IAuthDocument = (await createAuthUser(
      authData,
      transaction
    )) as IAuthDocument;

    // Verification link to be sent to the user's email
    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=${authData.emailVerificationToken}`;

    const userMessageDetails = {
      username: result.username,
      email: result.email,
      profilePicture: result.profilePicture,
      country: result.country,
      createdAt: result.createdAt,
      type: "auth",
    };
    await publishDirectMessage({
      channel: rabbitMQChannel,
      exchangeName: "user_ex_buyer_record",
      routingKey: "user_key_buyer_record",
      queueName: "user_queue_buyer_record",
      message: JSON.stringify(userMessageDetails),
      logMessage: "Buyer details sent to buyer service",
    });

    // send message to the notification service to send verification email
    const notificationMessageDetails: IEmailMessageDetails = {
      receiverEmail: result.email,
      verifyLink: verificationLink,
      template: "verifyEmail",
    };
    await publishDirectMessage({
      channel: rabbitMQChannel,
      exchangeName: "auth_ex_verification_email",
      queueName: "auth_queue_verification_email",
      routingKey: "auth_key_verification_email",
      message: JSON.stringify(notificationMessageDetails),
      logMessage: "Verify email message has been sent to notification service.",
    });

    await transaction.commit();

    res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      user: result,
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    if (!(transaction as { finished?: string }).finished) {
      await transaction.rollback();
    }
  }
}
