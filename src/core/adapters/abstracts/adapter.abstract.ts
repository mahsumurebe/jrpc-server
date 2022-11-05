import { TypeMiddlewareFn, TypeRegisterFn } from "../types";
import { Middleware } from "../libraries";
import { RequestExtendAbstract } from "./request-extend.abstract";
import { ResponseExtendAbstract } from "./response-extend.abstract";

const debug = require("debug")("jrpc:server:adapter:abstract");

/**
 * Adapter Abstract
 *
 * @abstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export abstract class AdapterAbstract<
  Request extends RequestExtendAbstract = RequestExtendAbstract,
  Response extends ResponseExtendAbstract = ResponseExtendAbstract
> {
  /**
   * Middlewares
   */
  public middleware = new Middleware<Request, Response>();

  /**
   * Registered request fn
   *
   * Function definition required for adapter integration with router manager
   *
   * @protected
   */
  protected registerFn: TypeRegisterFn;

  /**
   * Listen server
   *
   * @return {Promise<void>}
   */
  abstract listen(): Promise<void>;

  /**
   * Shutdown server
   *
   * @return {Promise<void>}
   */
  abstract shutdown(): Promise<void>;

  /**
   * Check server is listening
   *
   * @return {boolean}
   */
  abstract isListening(): boolean;

  /**
   * Use middleware
   * @param {Function} fn Middleware Fn
   *
   * @return {this}
   */
  use(fn: TypeMiddlewareFn<Request, Response>): this {
    this.middleware.add(fn);
    return this;
  }

  /**
   * Register
   * @param fn
   *
   * @return {this}
   */
  register(fn: TypeRegisterFn<Request, Response>): AdapterAbstract {
    debug("registering fn");
    this.registerFn = fn;
    return this;
  }

  /**
   * Process new request
   * @param {object} request Request Object
   * @param {object} response Response Object
   * @param {?Error} error Error
   */
  async newRequest(request: Request, response: Response, error?: Error) {
    debug(
      this.constructor.name,
      "executing new request",
      request.getClientId(),
      request.getBody()
    );
    const executedAllMiddlewares = await this.middleware.execute(
      request,
      response,
      error
    );

    if (executedAllMiddlewares) {
      await this.registerFn(request, response).catch((e) => {
        debug("an error occurred while calling registered function", e);
      });
    }
  }
}
