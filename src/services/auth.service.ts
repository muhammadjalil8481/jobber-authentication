import { config } from "@authentication/config";
import { AuthModel } from "@authentication/models/auth.model";
import {
  firstLetterUppercase,
  IAuthDocument,
} from "@muhammadjalil8481/jobber-shared";
import { sign } from "jsonwebtoken";
import { omit } from "lodash";
import { Model, Op, Transaction } from "sequelize";
import type { StringValue } from "ms";

export async function createAuthUser(
  data: IAuthDocument,
  transaction?: Transaction
): Promise<IAuthDocument> {
  const result = await AuthModel.create(data, { transaction });
  const authUser = result.dataValues;
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
  return user?.dataValues;
}

export async function getAuthUserByUsernameOrEmail(
  username: string,
  email: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      [Op.or]: [{ username: firstLetterUppercase(username) }, { email }],
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
  return user?.dataValues;
}

export async function getAuthUserByEmail(
  email: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      email,
    },
  })) as Model;
  return user?.dataValues;
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
  return user?.dataValues;
}

export async function getAuthUserByPasswordToken(
  token: string
): Promise<IAuthDocument> {
  const user: Model = (await AuthModel.findOne({
    where: {
      [Op.and]: [{ passwordResetToken: token }],
    },
    // attributes: {
    //   exclude: ["password"],
    // },
  })) as Model;
  return user?.dataValues;
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

export function signToken(
  payload: object,
  maxAge: StringValue
  // jwtId: string
): string {
  return sign(payload, config.JWT_TOKEN_SECRET, {
    expiresIn: maxAge,
    // jwtid: jwtId,
  });
}
