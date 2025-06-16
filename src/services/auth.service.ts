import { config } from "@authentication/config";
import { AuthModel } from "@authentication/models/auth.model";
import { publishDirectMessage } from "@authentication/queues/auth.producer";
import { rabbitMQChannel } from "@authentication/server";
import {
  firstLetterUppercase,
  IAuthDocument,
} from "@muhammadjalil8481/jobber-shared";
import { sign } from "jsonwebtoken";
import { lowerCase, omit } from "lodash";
import { Model, Op } from "sequelize";

export async function createAuthUser(
  data: IAuthDocument
): Promise<IAuthDocument> {
  const result = await AuthModel.create(data);
  const authUser = result.dataValues;
  const messageDetails = {
    username: authUser.username,
    email: authUser.email,
    profilePicture: authUser.profilePicture,
    country: authUser.country,
    createdAt: authUser.createdAt,
    type: "auth",
  };
  await publishDirectMessage({
    channel: rabbitMQChannel,
    exchangeName: "jobber-buyer-update",
    routingKey: "user-buyer",
    message: JSON.stringify(messageDetails),
    logMessage: "Buyer details sent to buyer service",
  });
  const userData: IAuthDocument = omit(authUser, ["password"]);
  return userData;
}

export async function getAuthUserById(id: number): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: { id },
    attributes: {
      exclude: ["password"],
    },
  })) as Model;
  return user.dataValues;
}

export async function getAuthUserByUsernameOrEmail(
  username: string,
  email: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      [Op.or]: [
        { username: firstLetterUppercase(username) },
        { email: lowerCase(email) },
      ],
    },
  })) as Model;
  return user?.dataValues;
}

export async function getAuthUserByUsername(
  username: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      username: firstLetterUppercase(username),
    },
  })) as Model;
  return user.dataValues;
}

export async function getAuthUserByEmail(
  email: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      email: lowerCase(email),
    },
  })) as Model;
  return user.dataValues;
}

export async function getAuthUserByVerificationToken(
  token: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      emailVerificationToken: token,
    },
    attributes: {
      exclude: ["password"],
    },
  })) as Model;
  return user.dataValues;
}

export async function getAuthUserByPasswordToken(
  token: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      [Op.and]: [
        { passwordResetToken: token },
        { passwordResetExpires: { [Op.gt]: new Date() } },
      ],
    },
    attributes: {
      exclude: ["password"],
    },
  })) as Model;
  return user.dataValues;
}

export async function updateVerifyEmailField(
  id: number,
  emailVerified: number,
  emailVerificationToken: string
): Promise<void> {
  await AuthModel.update(
    { emailVerificationToken, emailVerified },
    {
      where: {
        id,
      },
    }
  );
}

export async function updatePasswordToken(
  id: number,
  token: string,
  tokenExpiration: Date
): Promise<void> {
  await AuthModel.update(
    { passwordResetToken: token, passwordResetExpires: tokenExpiration },
    {
      where: {
        id,
      },
    }
  );
}

export async function updatePassword(
  id: number,
  password: string
): Promise<void> {
  await AuthModel.update(
    { password, passwordResetToken: "", passwordResetExpires: new Date() },
    {
      where: {
        id,
      },
    }
  );
}

export function signToken(id: number, email: string, username: string): string {
  return sign(
    {
      id,
      username,
      email,
    },
    config.JWT_TOKEN_SECRET
  );
}
