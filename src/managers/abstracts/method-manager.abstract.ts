/**
 * Method Manager Abstract
 *
 * @abstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
import { TypeMethodParam } from "../../core";

export abstract class MethodManagerAbstract {
  /**
   * Add method
   * @param {string} methodName
   * @param {Function} fn
   */
  abstract add<T = any>(
    methodName: string,
    fn: (...args: any) => T | Promise<T>
  ): void;

  /**
   * Is method exists ?
   *
   * @param methodName
   * @return {boolean}
   */
  abstract exist(methodName: string): boolean;

  /**
   * Remove method
   *
   * @param methodName
   */
  abstract remove(methodName: string): void;

  /**
   * Get Method Names
   *
   * @return {string[]}
   */
  abstract names(): string[];

  /**
   * Call method
   * @param {string} methodName Method Name
   * @param {object | Array<any>} params Parameters
   * @return {*}
   */
  abstract call<TData = any>(
    methodName: string,
    params: TypeMethodParam
  ): Promise<TData>;
}
