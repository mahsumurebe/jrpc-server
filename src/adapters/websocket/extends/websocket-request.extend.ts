import { IncomingMessage } from "http";
import {
  JRPCRequestBodyInterface,
  RequestExtendAbstract,
  TypePartialJRPCRequestBody,
} from "../../../core";

const debug = require("debug")("jrpc:server:adapters:websocket:extend:request");

/**
 * Websocket Request Extender
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class WebsocketRequestExtend<
  Request extends IncomingMessage = IncomingMessage
> extends RequestExtendAbstract {
  /**
   * Body
   *
   * @type {object}
   * @protected
   */
  protected readonly body:
    | Partial<JRPCRequestBodyInterface>
    | Partial<JRPCRequestBodyInterface>[];

  constructor(protected readonly request: Request, bodyString: string) {
    super();

    try {
      this.body = JSON.parse(bodyString);
    } catch (e) {
      this.body = undefined;
    }
    debug("creating request extender", this.body);
  }

  /**
   * Close Request
   *
   * @return {void|Promise<void>>}
   */
  close(): void | Promise<void> {
    return Promise.resolve();
  }

  /**
   * Get request body
   *
   * @return {?object|null}
   */
  getBody(): TypePartialJRPCRequestBody | undefined | null {
    return this.body;
  }

  /**
   * Get request client id
   * like ip address
   *
   * @return {string}
   */
  getClientId(): string {
    let header = this.request.headers["x-forwarded-for"];
    if (Array.isArray(header)) {
      header = header.join(",");
    }
    return header?.split(",").shift() || this.request.socket?.remoteAddress;
  }
}
