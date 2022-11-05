import EventEmitter from "events";
import { JRPCExceptionAbstract } from "../../exceptions";
import { TypeJRPCResponse } from "../../types";

const debug = require("debug")(
  "jrpc:server:adapters:abstracts:response-extend"
);

/**
 * Response Extend Abstract
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @abstract
 */
export abstract class ResponseExtendAbstract extends EventEmitter {
  /**
   * Response Data
   *
   * @type {object|object[]}
   * @protected
   */
  protected responseData: TypeJRPCResponse | TypeJRPCResponse[];

  protected constructor() {
    super();
  }

  once(
    eventName: "finish",
    listener: (response: TypeJRPCResponse | TypeJRPCResponse[]) => void
  );
  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(eventName, listener);
  }

  on(
    eventName: "finish",
    listener: (response: TypeJRPCResponse | TypeJRPCResponse[]) => void
  );
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  emit(
    eventName: "finish",
    response: TypeJRPCResponse | TypeJRPCResponse[]
  ): boolean;
  emit(eventName: string | symbol, ...args): boolean {
    return super.emit(eventName, ...args);
  }

  /**
   * Send empty response to client
   *
   * @return {Promise<void>}
   */
  abstract send();
  /**
   * Send Error Response to client
   *
   * @param {Error|Error[]} body Response Body
   *
   * @return {Promise<void>}
   */
  abstract send(body: JRPCExceptionAbstract | JRPCExceptionAbstract[]);
  /**
   * Send JSONRPC response to client
   *
   * @param {object|object[]} body Response Body
   *
   * @return {Promise<void>}
   */
  abstract send(body: TypeJRPCResponse | TypeJRPCResponse[]);
  /**
   * Send JSONRPC response to client
   *
   * @param {Error|Error[]|object|object[]} body Response Body
   *
   * @return {Promise<void>}
   */
  abstract send(
    body?:
      | JRPCExceptionAbstract
      | JRPCExceptionAbstract[]
      | TypeJRPCResponse
      | TypeJRPCResponse[]
  );

  /**
   * Destroy
   *
   * @return {Promise<void>}
   * @protected
   */
  protected destroy() {
    debug("destroy");
    this.removeAllListeners();
  }
}
