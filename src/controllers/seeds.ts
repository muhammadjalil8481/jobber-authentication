import { faker } from "@faker-js/faker";
import {
  firstLetterUppercase,
  IAuthDocument,
  lowerCase,
} from "@muhammadjalil8481/jobber-shared";
import { Request, Response } from "express";
import { v4 as uuidV4 } from "uuid";
import crypto from "crypto";
import { sample } from "lodash";
import { createAuthUser } from "@authentication/services/auth.service";
import { StatusCodes } from "http-status-codes";

export async function seedUsers(req: Request, res: Response): Promise<void> {
  const { count } = req.params;

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));

  for (const _number of count) {
    const authData: IAuthDocument = {
      username: firstLetterUppercase(faker.internet.username()),
      email: lowerCase(faker.internet.email()),
      profilePublicId: uuidV4(),
      password: "qwerty",
      country: faker.location.country(),
      profilePicture: faker.image.urlPicsumPhotos(),
      emailVerificationToken: randomBytes.toString("hex"),
      emailVerified: sample([0, 1]),
    } as IAuthDocument;

    await createAuthUser(authData, false);
  }

  res
    .status(StatusCodes.OK)
    .json({ message: "Seed users created successfully." });
}
