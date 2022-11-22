/**
 * JRPC Object Base Interface
 *
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @licence MIT
 * @interface
 */
export interface JRPCObjectBase {
  /**
   * ID
   *
   * If id is undefined or null, this is notification request/response
   *
   * @type {number|string|undefined|null}
   */
  id?: number | string | undefined | null;
  /**
   * JSONRPC Version
   *
   * It should 2.0
   *
   * @type {string}
   * @default 2.0
   */
  jsonrpc: "2.0";
}
