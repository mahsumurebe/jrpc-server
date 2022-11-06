import * as Client from "@mahsumurebe/jrpc-client";
import {
  CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
  CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
  InternalErrorException,
  InvalidParamsException,
  MethodNotFoundException,
  RequestTimeoutException,
} from "@mahsumurebe/jrpc-client";
import * as Server from "../src";
import { generateJRPCClient, generateJRPCServer } from "./utils/utils";

describe("JRPCServer", () => {
  let server: Server.JRPCServer;
  let client: Client.JRPCClient;
  describe("HTTP Server", () => {
    beforeAll(async () => {
      server = await generateJRPCServer(
        new Server.HttpAdapter({
          hostname: "localhost",
          port: 3000,
        })
      );
      client = await generateJRPCClient(
        new Client.HttpAdapter({
          hostname: "localhost",
          port: 3000,
          timeout: 2_000,
        })
      );
    });
    afterAll(async () => {
      await client.destroy();
      await server.shutdown();
    });
    describe("server status", () => {
      it("should be started", () => {
        expect(server.isListening()).toEqual(true);
      });
    });
    describe("Tests", () => {
      describe("call", () => {
        it("should be return response", async () => {
          await expect(
            client.call({
              id: 1,
              jsonrpc: "2.0",
              method: "foo",
              params: [1, 2, 3],
            })
          ).resolves.toEqual({
            id: 1,
            jsonrpc: "2.0",
            result: {
              a: 1,
              b: 2,
              c: 3,
            },
          });
        });
        it("should be timeout", async () => {
          await expect(
            client.call({
              id: 2,
              jsonrpc: "2.0",
              method: "timeout",
              params: [],
            })
          ).rejects.toThrow(new RequestTimeoutException());
        });
        it("should be return method not found error response", async () => {
          await expect(
            client.call({
              id: 2,
              jsonrpc: "2.0",
              method: "bar",
              params: [],
            })
          ).resolves.toEqual(new MethodNotFoundException(2));
        });
        it("should be return invalid params error response", async () => {
          await expect(
            client.call({
              id: 3,
              jsonrpc: "2.0",
              method: "bar",
              params: {},
            })
          ).resolves.toEqual(new InvalidParamsException(3));
        });
        it("should be return internal error response", async () => {
          await expect(
            client.call({
              id: 4,
              jsonrpc: "2.0",
              method: "foo-throw",
              params: [],
            })
          ).resolves.toEqual(
            new InternalErrorException(4, {
              data: "error detail",
              code: CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
              message: CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
            })
          );
        });
        it("should be able batch request and return response without notification request", async () => {
          await expect(
            client.call([
              {
                id: 1,
                jsonrpc: "2.0",
                method: "foo",
                params: [1, 2, 3],
              },
              {
                id: 2,
                jsonrpc: "2.0",
                method: "foo",
                params: [4, 5, 6],
              },
              {
                jsonrpc: "2.0",
                method: "foo",
                params: [7, 8, 9],
              },

              {
                id: 3,
                jsonrpc: "2.0",
                method: "foo",
                params: {},
              },
            ])
          ).resolves.toEqual([
            {
              id: 1,
              jsonrpc: "2.0",
              result: {
                a: 1,
                b: 2,
                c: 3,
              },
            },
            {
              id: 2,
              jsonrpc: "2.0",
              result: {
                a: 4,
                b: 5,
                c: 6,
              },
            },
            new InvalidParamsException(3),
          ]);
        });
      });
      describe("notification", () => {
        it("should be no response", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "foo",
              params: [1, 2, 3],
            })
          ).resolves.toBeUndefined();
        });
        it("should be no response (method not found error response)", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "bar",
              params: [],
            })
          ).resolves.toBeUndefined();
        });
        it("should be no response (invalid params error response)", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "bar",
              params: {},
            })
          ).resolves.toBeUndefined();
        });
        it("should be no response (internal error response)", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "foo-throw",
              params: [],
            })
          ).resolves.toBeUndefined();
        });
      });
    });
  });
  describe("WebSocket Server", () => {
    beforeAll(async () => {
      server = await generateJRPCServer(
        new Server.WebsocketAdapter({
          hostname: "localhost",
          port: 3000,
        })
      );
      client = await generateJRPCClient(
        new Client.WebsocketAdapter({
          hostname: "localhost",
          port: 3000,
          timeout: 2_000,
        })
      );
    });
    afterAll(async () => {
      await client.destroy();
      await server.shutdown();
    });
    describe("server status", () => {
      it("should be started", () => {
        expect(server.isListening()).toEqual(true);
      });
    });
    describe("Tests", () => {
      describe("call", () => {
        it("should be return response", async () => {
          await expect(
            client.call({
              id: 1,
              jsonrpc: "2.0",
              method: "foo",
              params: [1, 2, 3],
            })
          ).resolves.toEqual({
            id: 1,
            jsonrpc: "2.0",
            result: {
              a: 1,
              b: 2,
              c: 3,
            },
          });
        });
        it("should be timeout", async () => {
          await expect(
            client.call({
              id: 2,
              jsonrpc: "2.0",
              method: "timeout",
              params: [],
            })
          ).rejects.toThrow(new RequestTimeoutException());
        });
        it("should be return method not found error response", async () => {
          await expect(
            client.call({
              id: 2,
              jsonrpc: "2.0",
              method: "bar",
              params: [],
            })
          ).resolves.toEqual(new MethodNotFoundException(2));
        });
        it("should be return invalid params error response", async () => {
          await expect(
            client.call({
              id: 3,
              jsonrpc: "2.0",
              method: "bar",
              params: {},
            })
          ).resolves.toEqual(new InvalidParamsException(3));
        });
        it("should be return internal error response", async () => {
          await expect(
            client.call({
              id: 4,
              jsonrpc: "2.0",
              method: "foo-throw",
              params: [],
            })
          ).resolves.toEqual(
            new InternalErrorException(4, {
              data: "error detail",
              code: CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
              message: CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
            })
          );
        });
        it("should be able batch request and return response without notification request", async () => {
          await expect(
            client.call([
              {
                id: 1,
                jsonrpc: "2.0",
                method: "foo",
                params: [1, 2, 3],
              },
              {
                id: 2,
                jsonrpc: "2.0",
                method: "foo",
                params: [4, 5, 6],
              },
              {
                jsonrpc: "2.0",
                method: "foo",
                params: [7, 8, 9],
              },

              {
                id: 3,
                jsonrpc: "2.0",
                method: "foo",
                params: {},
              },
            ])
          ).resolves.toEqual([
            {
              id: 1,
              jsonrpc: "2.0",
              result: {
                a: 1,
                b: 2,
                c: 3,
              },
            },
            {
              id: 2,
              jsonrpc: "2.0",
              result: {
                a: 4,
                b: 5,
                c: 6,
              },
            },
            new InvalidParamsException(3),
          ]);
        });
      });
      describe("notification", () => {
        it("should be no response", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "foo",
              params: [1, 2, 3],
            })
          ).resolves.toBeUndefined();
        });
        it("should be no response (method not found error response)", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "bar",
              params: [],
            })
          ).resolves.toBeUndefined();
        });
        it("should be no response (invalid params error response)", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "bar",
              params: {},
            })
          ).resolves.toBeUndefined();
        });
        it("should be no response (internal error response)", async () => {
          await expect(
            client.notification({
              jsonrpc: "2.0",
              method: "foo-throw",
              params: [],
            })
          ).resolves.toBeUndefined();
        });
      });
    });
  });
});
