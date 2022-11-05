import EventEmitter from "events";
import { TypePartialJRPCRequestBody } from "../../types";

const debug = require("debug")("jrpc:server:adapters:abstracts:request-extend");

/**
 * Request Extend Abstract
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @abstract
 */
export abstract class RequestExtendAbstract extends EventEmitter {
  /**
   * Get request client id
   * like ip address
   *
   * @return {string}
   */
  abstract getClientId(): string;

  /**
   * Get request body
   *
   * @return {?object|null}
   */
  abstract getBody(): TypePartialJRPCRequestBody | undefined | null;

  /**
   * Close Request
   * @param {?number} timeoutMs Disconnect timeout
   * @return {void|Promise<void>>}
   */
  abstract close(timeoutMs?: number): void | Promise<void>;

  once(eventName: "close", listener: () => void);
  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(eventName, listener);
  }

  on(eventName: "close", listener: () => void);
  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(eventName, listener);
  }

  emit(eventName: "close"): boolean;
  emit(eventName: string | symbol, ...args): boolean {
    return super.emit(eventName, ...args);
  }

  /**
   * Destroy
   *
   * @return {Promise<void>}
   * @protected
   */
  protected destroy() {
    debug("destroy");
    this.eventNames().forEach((eventName) => {
      debug(`removing ${eventName.toString()} listener form request extender`);
      this.removeAllListeners(eventName);
    });
  }
}
