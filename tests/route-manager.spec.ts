import { MethodManager, RouterManager, validator } from "../src";
import {
  CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
  CONST_RPC_ERROR_CODE_INVALID_PARAMS,
  CONST_RPC_ERROR_CODE_INVALID_REQUEST,
  CONST_RPC_ERROR_CODE_METHOD_NOT_FOUND,
  CONST_RPC_ERROR_CODE_PARSE_ERROR,
  CONST_RPC_ERROR_CODE_SERVER_ERROR,
  CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
  CONST_RPC_ERROR_MESSAGE_INVALID_PARAMS,
  CONST_RPC_ERROR_MESSAGE_INVALID_REQUEST,
  CONST_RPC_ERROR_MESSAGE_METHOD_NOT_FOUND,
  CONST_RPC_ERROR_MESSAGE_PARSE_ERROR,
  CONST_RPC_ERROR_MESSAGE_SERVER_ERROR,
  InternalErrorException,
  InvalidParamsException,
  InvalidRequestException,
  MethodNotFoundException,
  ParseErrorException,
  ServerErrorException,
} from "../src/core";

describe("RouterManager", () => {
  const methodManager = new MethodManager();
  const routerManager = new RouterManager(methodManager, {
    paramType: "array",
    validator,
  });
  methodManager.add("test", () => {
    return true;
  });
  methodManager.add("throwable", (arg0) => {
    throw new Error(arg0);
  });
  describe("generateErrorResponse", () => {
    describe("Internal Error", () => {
      it("should be generate error response", () => {
        expect(
          routerManager.generateErrorResponse(null, new Error("foo"))
        ).toEqual({
          id: null,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
            message: CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
            data: "Error: foo",
          },
        });
      });
      it("should be generate error response with id", () => {
        expect(
          routerManager.generateErrorResponse(1, new Error("bar"))
        ).toEqual({
          id: 1,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
            message: CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
            data: "Error: bar",
          },
        });
      });
    });
    describe("Base Error", () => {
      it("should be return Internal Error response", () => {
        expect(
          routerManager.generateErrorResponse(
            3,
            new InternalErrorException("data3")
          )
        ).toEqual({
          id: 3,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
            message: CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
            data: "data3",
          },
        });
      });
      it("should be return Invalid Params response", () => {
        expect(
          routerManager.generateErrorResponse(
            4,
            new InvalidParamsException("data4")
          )
        ).toEqual({
          id: 4,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_INVALID_PARAMS,
            message: CONST_RPC_ERROR_MESSAGE_INVALID_PARAMS,
            data: "data4",
          },
        });
      });
      it("should be return Invalid Request response", () => {
        expect(
          routerManager.generateErrorResponse(
            5,
            new InvalidRequestException("data5")
          )
        ).toEqual({
          id: 5,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_INVALID_REQUEST,
            message: CONST_RPC_ERROR_MESSAGE_INVALID_REQUEST,
            data: "data5",
          },
        });
      });
      it("should be return Method Not Found response", () => {
        expect(
          routerManager.generateErrorResponse(
            6,
            new MethodNotFoundException("data6")
          )
        ).toEqual({
          id: 6,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_METHOD_NOT_FOUND,
            message: CONST_RPC_ERROR_MESSAGE_METHOD_NOT_FOUND,
            data: "data6",
          },
        });
      });
      it("should be return Parse Error response", () => {
        expect(
          routerManager.generateErrorResponse(
            7,
            new ParseErrorException("data7")
          )
        ).toEqual({
          id: 7,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_PARSE_ERROR,
            message: CONST_RPC_ERROR_MESSAGE_PARSE_ERROR,
            data: "data7",
          },
        });
      });
      it("should be return Server Error response", () => {
        expect(
          routerManager.generateErrorResponse(
            8,
            new ServerErrorException("data8")
          )
        ).toEqual({
          id: 8,
          jsonrpc: "2.0",
          error: {
            code: CONST_RPC_ERROR_CODE_SERVER_ERROR,
            message: CONST_RPC_ERROR_MESSAGE_SERVER_ERROR,
            data: "data8",
          },
        });
      });
    });
  });
  describe("processMethod", () => {
    it("should be processing method", async () => {
      await expect(
        routerManager.processMethod({
          id: 9,
          jsonrpc: "2.0",
          method: "test",
          params: [1, 2, 3],
        })
      ).resolves.toEqual({
        id: 9,
        jsonrpc: "2.0",
        result: true,
      });
    });
    it("should be return Method Not Found response", async () => {
      await expect(
        routerManager.processMethod({
          id: 10,
          jsonrpc: "2.0",
          method: "foo",
          params: [],
        })
      ).resolves.toEqual(new MethodNotFoundException().toResponseObj(10));
    });
  });
  describe("request", () => {
    it("should be processing method", async () => {
      await expect(
        routerManager.request({
          id: 11,
          jsonrpc: "2.0",
          method: "test",
          params: [1, 2, 3],
        })
      ).resolves.toEqual({
        id: 11,
        jsonrpc: "2.0",
        result: true,
      });
    });
    it("should be return Method Not Found response", async () => {
      await expect(
        routerManager.request({
          id: 12,
          jsonrpc: "2.0",
          method: "foo",
          params: [],
        })
      ).resolves.toEqual(new MethodNotFoundException().toResponseObj(12));
    });
    it("should be return Invalid Params response", async () => {
      await expect(
        routerManager.request({
          id: 13,
          jsonrpc: "2.0",
          method: "test",
          params: {},
        })
      ).resolves.toEqual(new InvalidParamsException().toResponseObj(13));
    });
    it("should be batch request support", async () => {
      await expect(
        routerManager.request([
          {
            id: 14,
            jsonrpc: "2.0",
            method: "test",
            params: [],
          },
          {
            id: 15,
            jsonrpc: "2.0",
            method: "foo",
            params: {},
          },
          {
            id: 16,
            jsonrpc: "2.0",
            method: "throwable",
            params: ["error inline"],
          },
        ])
      ).resolves.toEqual([
        {
          id: 14,
          jsonrpc: "2.0",
          result: true,
        },
        new InvalidParamsException().toResponseObj(15),
        new InternalErrorException(new Error("error inline")).toResponseObj(16),
      ]);
    });
  });
});
