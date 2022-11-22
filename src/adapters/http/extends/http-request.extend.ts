import { IncomingMessage } from "http";
import {
  RequestExtendAbstract,
  timeout,
  TypePartialJRPCRequestBody,
} from "../../../core";
import { RequestCloseTimeoutException } from "../exceptions";

const debug = require("debug")("jrpc:server:adapters:http:extend:request");

/**
 * Http Request Extender
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class HttpRequestExtend<
  Request extends IncomingMessage = IncomingMessage
> extends RequestExtendAbstract {
  constructor(
    public readonly request: Request & {
      body?: TypePartialJRPCRequestBody | undefined | null;
    }
  ) {
    super();
    this.request.connection.on("close", () => {
      debug("request closing");
      this.emit("close");
      return this.destroy();
    });
  }

  /**
   * Get HTTP Method
   *
   * @return {string}
   */
  getMethod() {
    return this.request.method;
  }

  /**
   * Get request body
   *
   * @return {?object|null}
   */
  getBody(): TypePartialJRPCRequestBody | undefined | null {
    return this.request.body;
  }

  /**
   * Close Request
   * @param {?number} timeoutMs Disconnect timeout
   * @return {void|Promise<void>>}
   */
  close(timeoutMs?: number): void | Promise<void> {
    debug("close connection");

    const closePromise = new Promise<void>((resolve, reject) => {
      this.request.destroy();
      let clear: () => void;
      const closeEventFn = () => {
        debug("closed");
        clear();
        resolve();
      };
      const errorEventFn = (error: Error) => {
        debug("close error", error);
        clear();
        reject(error);
      };

      this.request.on("close", closeEventFn);
      this.request.on("error", errorEventFn);

      clear = () => {
        this.request.removeListener("close", closeEventFn);
        this.request.removeListener("error", errorEventFn);
      };
    }).finally(() => {
      debug("closing finally");
    });
    if (timeoutMs) {
      return timeout(
        timeoutMs,
        closePromise,
        new RequestCloseTimeoutException()
      );
    }
    return closePromise;
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

  /**
   * Destroy
   *
   * @return {Promise<void>}
   * @protected
   */
  protected async destroy() {
    super.destroy();
    await this.close();
    this.request.eventNames().forEach((eventName) => {
      debug(`removing ${eventName.toString()} listener form request`);
      this.request.removeAllListeners(eventName);
    });
  }
}
