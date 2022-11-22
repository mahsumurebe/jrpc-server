import {
  InternalErrorException,
  JRPCErrorResponseBodyInterface,
  JRPCExceptionAbstract,
  JRPCRequestBodyInterface,
  TypeId,
  TypeJRPCResponse,
} from "../../core";
import { RouterManagerConfigInterface } from "../router";
import { MethodManagerAbstract } from "./method-manager.abstract";

const debug = require("debug")("jrpc:server:abstract:manager:router");

/**
 * Router Manager Abstract
 *
 * @abstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export abstract class RouterManagerAbstract {
  constructor(
    protected readonly methodManager: MethodManagerAbstract,
    protected readonly config: RouterManagerConfigInterface
  ) {}

  generateErrorResponse(
    id: TypeId,
    error: Error | JRPCExceptionAbstract
  ): JRPCErrorResponseBodyInterface {
    debug("generating error response");
    let err: JRPCExceptionAbstract;
    if (error instanceof JRPCExceptionAbstract) {
      err = error;
    } else {
      debug("internal error", error.toString());
      err = new InternalErrorException(error);
    }
    return err.toResponseObj(id);
  }

  abstract request(
    body:
      | Partial<JRPCRequestBodyInterface>
      | Partial<JRPCRequestBodyInterface>[]
  ): Promise<TypeJRPCResponse | TypeJRPCResponse[]>;
}
