import { Request, Response } from "express";
import {
  authMock,
  authMockRequest,
  authMockResponse,
  authUserPayload,
} from "../test/mocks/auth.mock";
import * as auth from "../../services/auth.service";
import { getCurrentUser } from "../../controllers/current-user";

jest.mock("@authentication/services/auth.service");
jest.mock("@muhammadjalil8481/jobber-shared");
jest.mock("@authentication/queues/auth.producer");
jest.mock("@elastic/elasticsearch");

jest.mock("@muhammadjalil8481/jobber-shared", () => ({
  winstonLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  LogLevel: {
    DEBUG: "debug",
  },
  createConfig: jest.fn(() => ({
    get: jest.fn((key: string) => {
      const configMap: Record<string, string> = {
        ELASTIC_SEARCH_URL: "http://localhost:9200", // example mock value
      };
      return configMap[key];
    }),
  })),
}));

const USERNAME = "Manny";
const PASSWORD = "manny1";

describe("CurrentUser", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe("current user method", () => {
    it("should return authenticated user", async () => {
      const req: Request = authMockRequest(
        {},
        { username: USERNAME, password: PASSWORD },
        authUserPayload
      ) as unknown as Request;
      const res: Response = authMockResponse();
      jest.spyOn(auth, "getAuthUserById").mockResolvedValue(authMock);

      await getCurrentUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authenticated user",
        user: authMock,
      });
    });
  });

  it("should return empty user", async () => {
    const req: Request = authMockRequest(
      {},
      { username: USERNAME, password: PASSWORD },
      authUserPayload
    ) as unknown as Request;
    const res: Response = authMockResponse();
    jest.spyOn(auth, "getAuthUserById").mockResolvedValue({} as never);

    await getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Authenticated user",
      user: null,
    });
  });
});
