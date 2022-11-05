import { TypeMiddlewareFn, TypeNextFunction } from "../types";
import { TypeJRPCResponse } from "../../types";
import { RequestExtendAbstract, ResponseExtendAbstract } from "../abstracts";
import { JRPCExceptionAbstract, ParseErrorException } from "../../exceptions";

const debug = require("debug")("jrpc:server:adapter:middleware");

export class Middleware<
  Request extends RequestExtendAbstract = RequestExtendAbstract,
  Response extends ResponseExtendAbstract = ResponseExtendAbstract
> {
  protected middlewares: TypeMiddlewareFn<Request, Response>[] = [];

  /**
   * Clear Middlewares
   *
   * @return {void}
   */
  clear() {
    this.middlewares = [];
  }

  /**
   * Insert FN to zero index
   * @param {Function} fn Middleware Fn
   *
   * @return {void}
   */
  addFirst(fn: TypeMiddlewareFn<Request, Response>) {
    debug("add first");
    this.middlewares = [fn, ...this.middlewares];
  }

  /**
   * Add Middleware Function
   *
   * @param {Function} fn Middleware Fn
   *
   * @return {void}
   */
  add(fn: TypeMiddlewareFn<Request, Response>) {
    debug("adding middleware");
    this.middlewares.push(fn);
  }

  /**
   * Execute middlewares
   * @param {object} request
   * @param {object} response
   * @param {Error} baseError
   *
   * @return {boolean} When all middlewares are executed return true, otherwise return false
   */
  async execute(request: Request, response: Response, baseError?: Error) {
    debug("executing middlewares");
    let index = 0;
    let err: Error | undefined;
    const middlewares: TypeMiddlewareFn<Request, Response>[] = [
      ...this.middlewares,

      (
        error?: JRPCExceptionAbstract,
        req?: Request,
        res?: Response,
        next?: TypeNextFunction
      ) => {
        debug("end middleware");
        res.on("finish", (responseData: TypeJRPCResponse) => {
          debug(
            `response sent to ${req.getClientId()} body: ${JSON.stringify(
              responseData
            )}`
          );
        });
        req.on("close", () => {
          debug("request closed");
        });
        if (typeof error !== "undefined") {
          if (error instanceof SyntaxError) {
            debug("parseable body was not sent");
            res.send(new ParseErrorException());
            next(new ParseErrorException());
            return;
          }
          debug("error response", error);
          res.send(error);
          next(error);
          return;
        }
        next();
      },
    ];
    const nextFn: TypeNextFunction = async (error) => {
      const fn = middlewares[index];
      index += 1;
      err = error;
      if (fn) {
        try {
          await fn(err, request, response, nextFn);
        } catch (e) {
          err = e;
        }
      }
    };
    await nextFn(baseError);
    return !err;
  }
}
