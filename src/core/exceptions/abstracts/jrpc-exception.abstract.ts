import {
  JRPCErrorInline,
  JRPCErrorResponseBodyInterface,
} from "../../interfaces";
import { TypeId } from "../../types";
import { JRPCServerBaseException } from "./jrpc-server-base.exception";

/**
 * JRPC Exception Abstract
 *
 * @abstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export abstract class JRPCExceptionAbstract extends JRPCServerBaseException {
  protected constructor(
    public readonly code: number,
    message: string,
    public readonly data?: any
  ) {
    super(message);
  }

  /**
   * Error to Object
   *
   * @return {object}
   */
  toObject(): JRPCErrorInline {
    return {
      code: this.code,
      message: this.message,
      data: this.data?.toString(),
    };
  }

  /**
   * To response object
   * @param id
   *
   * @return {object}
   */
  toResponseObj(id: TypeId = null): JRPCErrorResponseBodyInterface {
    return {
      id,
      jsonrpc: "2.0",
      error: this.toObject(),
    };
  }

  /**
   * Error to JSON String
   *
   * @return {string}
   */
  toJSON() {
    return JSON.stringify(this.toObject());
  }

  /**
   * Stringify error
   *
   * @return {string}
   */
  toString() {
    let data: string = "";
    if (this.data) {
      if (Array.isArray(this.data) || typeof this.data === "object") {
        data = `data ${JSON.stringify(this.data)}`;
      } else {
        data = `data ${this.data.toString()}`;
      }
    }
    return `RPC Error: Code ${this.code} ${this.message}${data}`;
  }
}
