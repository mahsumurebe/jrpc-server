import { HttpAdapterSSLConfigInterface } from "./http-adapter-ssl-config.interface";

/**
 * HTTP Adapter Config Interface
 *
 * @interface
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export interface HttpAdapterConfigInterface {
  /**
   * Port for listening
   *
   * @type {number}
   */
  port: number;

  /**
   * Host name for listening
   *
   * @default 127.0.0.1
   * @type {?string}
   */
  hostname?: string;

  /**
   * Path name for listening
   *
   * @default /
   * @type {?string}
   */
  pathname?: string;

  /**
   * If set to `true`, it enables keep-alive functionality on the socket immediately after a new incoming connection is received,
   * similarly on what is done in `socket.setKeepAlive([enable][, initialDelay])`.
   *
   * @default false
   * @since v16.5.0
   */
  keepAlive?: boolean | undefined;
  /**
   * If set to a positive number, it sets the initial delay before the first keepalive probe is sent on an idle socket.
   * @default 0
   * @since v16.5.0
   */
  keepAliveInitialDelay?: number | undefined;

  /**
   * SSL Config for Server
   * If this information is defined, it will try to serve the server with https protocol.
   * @type {?object}
   */
  ssl?: HttpAdapterSSLConfigInterface;
}
