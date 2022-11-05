/**
 * Method Manager for JSONRPC Server
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
import {
  InternalErrorException,
  JRPCExceptionAbstract,
  MethodNotFoundException,
  TypeMethodParam,
} from "../../core";
import { MethodManagerAbstract } from "../abstracts";

const debug = require("debug")("jrpc:server:managers:method");

export class MethodManager extends MethodManagerAbstract {
  /**
   * Method List
   * @protected
   */
  protected methods: Record<string, (...args: any) => any | Promise<any>> = {};

  /**
   * Add method
   * @param {string} methodName
   * @param {Function} fn
   */
  add<T = any>(methodName: string, fn: (...args: any) => T | Promise<T>): void {
    debug(`adding ${methodName} method`);
    this.methods[methodName] = fn;
  }

  /**
   * Is method exists ?
   *
   * @param methodName
   * @return {boolean}
   */
  exist(methodName: string): boolean {
    debug(`checking ${methodName} exist`);
    return typeof this.methods[methodName] !== "undefined";
  }

  /**
   * Remove method
   *
   * @param methodName
   */
  remove(methodName: string): void {
    debug(`removing ${methodName}`);
    if (this.exist(methodName)) {
      delete this.methods[methodName];
      debug(`${methodName} method removed`);
    } else {
      debug(`method ${methodName} not found. Deletion failed`);
    }
  }

  /**
   * Get Method Names
   *
   * @return {string[]}
   */
  names(): string[] {
    debug(`returning method names`);
    return Object.keys(this.methods);
  }

  call(methodName: string, params: TypeMethodParam): Promise<any> {
    if (this.exist(methodName) === false) {
      throw new MethodNotFoundException();
    }
    debug(
      `Calling ${methodName} method with ${
        params ? JSON.stringify(params) : "no"
      } params`
    );
    const fn: (...args: any) => Promise<any> = this.methods[methodName];
    let promise: Promise<any>;
    if (Array.isArray(params)) {
      promise = Promise.resolve<any>(fn(...params));
    } else {
      promise = Promise.resolve<any>(fn(params));
    }
    promise.catch((e: JRPCExceptionAbstract | Error) => {
      let err: JRPCExceptionAbstract = e as any;
      if (!(e instanceof JRPCExceptionAbstract)) {
        err = new InternalErrorException(e);
      }
      debug(
        `An error occurred while calling ${methodName} method.`,
        err.toString()
      );
      throw err;
    });

    return promise;
  }
}
