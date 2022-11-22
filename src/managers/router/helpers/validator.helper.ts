import {
  InvalidParamsException,
  InvalidRequestException,
  JRPCExceptionAbstract,
  JRPCRequestBodyInterface,
} from "../../../core";
import { RouterManagerConfigInterface } from "../interfaces";

export function validator(
  body: Partial<JRPCRequestBodyInterface>,
  options: RouterManagerConfigInterface
): JRPCExceptionAbstract | true {
  const keys = Object.keys(body);
  const check =
    keys.indexOf("method") > -1 &&
    keys.indexOf("params") > -1 &&
    keys.indexOf("jsonrpc") > -1 &&
    body.jsonrpc === "2.0";
  if (!check) {
    return new InvalidRequestException();
  }
  if (
    (Array.isArray(body.params) && options.paramType !== "array") ||
    (!Array.isArray(body.params) &&
      typeof body.params === "object" &&
      options.paramType !== "object")
  ) {
    return new InvalidParamsException();
  }
  return true;
}
