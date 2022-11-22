import { WebSocket } from "ws";
import {
  JRPCExceptionAbstract,
  ResponseExtendAbstract,
  TypeJRPCResponse,
} from "../../../core";

const debug = require("debug")(
  "jrpc:server:adapters:websocket:extend:response"
);

/**
 * Websocket Response Extender
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class WebsocketResponseExtend extends ResponseExtendAbstract {
  constructor(protected readonly ws: WebSocket) {
    super();
    debug("creating response extender");
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
    let responseData: TypeJRPCResponse | TypeJRPCResponse[];
    if (body) {
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
      } else if (body instanceof JRPCExceptionAbstract) {
        responseData = body.toResponseObj();
      } else {
        responseData = body;
      }
      if (responseData) {
        this.responseData = responseData;
      }
    }
    if (responseData) {
      const responseDataString = JSON.stringify(responseData);
      debug("sending data", responseDataString);
      this.ws.send(responseDataString);
      this.emit("finish", responseData);
    }
  }
}
