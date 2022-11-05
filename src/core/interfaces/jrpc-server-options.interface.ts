/**
 * JRPC Server Options
 *
 * @interface
 */
import {
  MethodManagerAbstract,
  RouterManagerAbstract,
} from "../../managers/abstracts";
import { JRPCExceptionAbstract } from "../exceptions";
import { JRPCRequestBodyInterface } from "./jrpc-request-body.interface";

/**
 * JRPC Server Options Generic
 *
 * @interface
 */
export interface JRPCServerOptionsInterface {
  paramType?: "object" | "array";
  /**
   * Method Manager
   *
   * @type {?MethodManagerAbstract}
   */
  methodManager?: MethodManagerAbstract;
  /**
   * Router Manager
   *
   * @type {?RouterManagerAbstract}
   */
  routerManager?: RouterManagerAbstract;
  /**
   * Request Body Validator
   *
   * @type {?Function}
   */
  validator?: (
    body: Partial<JRPCRequestBodyInterface>
  ) => JRPCExceptionAbstract | true;
}
