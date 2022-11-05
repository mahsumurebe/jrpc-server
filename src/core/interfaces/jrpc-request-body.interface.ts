import { JRPCObjectBase } from "./jrpc-object.base";
import { TypeMethodParam } from "../types";

/**
 * JSONRPC Request Body Interface
 *
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @licence MIT
 * @interface
 */
export interface JRPCRequestBodyInterface extends JRPCObjectBase {
  /**
   * ID
   *
   *
   * @type {number|string}
   */
  id: number | string;

  /**
   * Method Name
   *
   * @type {string}
   */
  method: string;

  /**
   * Method Param values
   *
   * @type {object|array}
   */
  params: TypeMethodParam;
}
