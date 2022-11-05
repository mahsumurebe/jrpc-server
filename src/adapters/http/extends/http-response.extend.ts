import { ServerResponse } from "http";
import {
  JRPCExceptionAbstract,
  ResponseExtendAbstract,
  TypeJRPCResponse,
} from "../../../core";
import { getHttpStatusCodeByErrCode } from "../helpers";

/**
 * HTTP Response Extender
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class HttpResponseExtend extends ResponseExtendAbstract {
  /**
   * Response sended
   *
   * @type {boolean}
   * @protected
   */
  protected isFinished = false;

  constructor(public readonly response: ServerResponse) {
    super();
    this.response.once("finish", () => {
      this.isFinished = true;
      this.emit("finish", this.responseData);
      this.destroy();
    });
  }

  /**
   * Send JSONRPC response to client
   *
   * @param {Error|Error[]|object|object[]} body Response Body
   *
   * @return {Promise<void>}
   */
  send(
    body?:
      | JRPCExceptionAbstract
      | JRPCExceptionAbstract[]
      | TypeJRPCResponse
      | TypeJRPCResponse[]
  ) {
    if (this.isFinished) {
      return;
    }
    let statusCode = 204;
    let responseData: TypeJRPCResponse | TypeJRPCResponse[];
    const headers = {};
    if (body) {
      statusCode = 200;
      this.response.setHeader("Content-Type", "application/json");
      if (Array.isArray(body)) {
        if (body.length > 0) {
          responseData = (
            body as (JRPCExceptionAbstract | TypeJRPCResponse)[]
          ).map((item) => {
            let data: TypeJRPCResponse;
            if (item instanceof JRPCExceptionAbstract) {
              data = item.toResponseObj();
            } else {
              data = item;
            }

            return data;
          });
        }
      } else {
        if (body instanceof JRPCExceptionAbstract) {
          responseData = body.toResponseObj();
        } else {
          responseData = body;
        }
        if ("error" in responseData) {
          statusCode = getHttpStatusCodeByErrCode(responseData.error.code);
        }
      }
      if (responseData) {
        this.responseData = responseData;
      }
    }
    const response = this.response.writeHead(statusCode, headers);
    if (responseData) {
      this.response.write(JSON.stringify(responseData));
    }
    response.end();
  }
}
