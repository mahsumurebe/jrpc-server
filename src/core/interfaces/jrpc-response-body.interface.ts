import { JRPCObjectBase } from "./jrpc-object.base";

/**
 * JSONRPC Response Body Interface
 *
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @licence MIT
 * @interface
 */
export interface JRPCResponseBodyInterface extends JRPCObjectBase {
  /**
   * Result
   *
   * @type {any}
   */
  result: any;
}
