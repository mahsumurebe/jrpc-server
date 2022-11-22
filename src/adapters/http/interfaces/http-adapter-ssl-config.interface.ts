/**
 * SSL Config for HTTP Adapter
 *
 * @interface
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export interface HttpAdapterSSLConfigInterface {
  /**
   * Certificate
   *
   * @type {string}
   */
  cert: string;
  /**
   * Private key
   *
   * @type {string}
   */
  privateKey: string;
}
