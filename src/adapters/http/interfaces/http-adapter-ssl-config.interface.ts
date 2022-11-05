/**
 * SSL Config for HTTP Adapter
 *
 * @interface
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export interface HttpAdapterSSLConfigInterface {
  /**
   * Certificate file path
   *
   * @type {string}
   */
  certFile: string;
  /**
   * Private key file path
   *
   * @type {string}
   */
  privateKey: string;
}
