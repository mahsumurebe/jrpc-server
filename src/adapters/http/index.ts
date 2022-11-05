import * as http from "http";
import { IncomingMessage, ServerResponse } from "http";
import * as https from "https";
import * as URL from "url";
import {
  AdapterAbstract,
  InvalidRequestException,
  JRPCRequestBodyInterface,
} from "../../core";
import { HttpAdapterConfigInterface } from "./interfaces";
import { HttpRequestExtend, HttpResponseExtend } from "./extends";

export * from "./interfaces";

const debug = require("debug")("jrpc:server:adapters:http");

/**
 * HTTP Server Adapter for JSONRPC Server
 *
 *
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @licence MIT
 *
 * @example
 * // Create adapter for HTTP Connection
 * const adapter = new HttpAdapter({
 *   hostname: "localhost",
 *   port: 3000,
 * })
 *
 * @example
 * // Create adapter for HTTPs Connection
 * const adapter = new HttpAdapter({
 *   hostname: "localhost",
 *   port: 3000,
 *   ssl: {
 *     certFile: "/path/to/site.cert",
 *     privateKey: "/path/to/site.key",
 *   },
 * })
 */
export class HttpAdapter extends AdapterAbstract<
  HttpRequestExtend,
  HttpResponseExtend
> {
  /**
   * Http Server
   *
   * @type {http.Server | https.Server}
   */
  public server: http.Server | https.Server;

  /**
   * Server is started
   *
   * @protected
   */
  protected isListened = false;

  constructor(public readonly config: HttpAdapterConfigInterface) {
    super();
    debug("initializing");

    const configDefault: Partial<HttpAdapterConfigInterface> = {
      hostname: "127.0.0.1",
      pathname: "/",
    };

    this.config = {
      ...(configDefault as HttpAdapterConfigInterface),
      ...(this.config ?? {}),
    };

    this.config.pathname = `/${(this.config.pathname ?? "").replace(
      /\/+/g,
      ""
    )}`;
    const options: http.ServerOptions = {
      keepAlive: this.config.keepAlive,
      keepAliveInitialDelay: this.config.keepAliveInitialDelay,
    };
    if (this.config.ssl) {
      const httpsOptions: https.ServerOptions = {
        ...options,
        cert: this.config.ssl.cert,
        key: this.config.ssl.privateKey,
      };
      this.server = https.createServer(httpsOptions, (...args) =>
        this.requestListener(...args)
      );
    } else {
      this.server = http.createServer(options, (...args) =>
        this.requestListener(...args)
      );
    }
  }

  /**
   * Listen server
   *
   * @return {Promise<void>}
   */
  async listen(): Promise<void> {
    if (this.isListened) {
      return Promise.resolve();
    }
    this.use((error, req, res, next) => {
      if (req.getMethod() === "POST") {
        next();
      } else {
        res.send(new InvalidRequestException());
      }
    });
    return new Promise<void>((resolveFn, rejectFn) => {
      try {
        this.server = this.server.listen(
          this.config.port,
          this.config.hostname ?? "127.0.0.1",
          () => {
            this.isListened = true;
            resolveFn();
          }
        );

        this.server.once("listening", () => {
          debug(
            `listening on ${this.config.ssl ? "https" : "http"}://${
              this.config.hostname ?? "127.0.0.1"
            }:${this.config.port}${this.config.pathname}`
          );
        });
        this.server.once("close", () => {
          this.isListened = false;
          this.server.removeAllListeners();
          debug("server closed");
        });
      } catch (e) {
        debug("An error occurred while listening server.", e);
        rejectFn(e);
      }
    });
  }

  /**
   * Shutdown server
   *
   * @return {Promise<void>}
   */
  async shutdown(): Promise<void> {
    if (this.isListened) {
      debug("shutdown http adapters");
      const { server } = this;
      if (server.closeIdleConnections) {
        debug("closing idle connections");
        server.closeIdleConnections();
      }

      if (server.closeAllConnections) {
        debug("closing all connections");
        server.closeAllConnections();
      }

      const shutdownPromise = new Promise<void>((resolve, reject) => {
        debug("closing server");
        server.close((err) => {
          if (err) {
            debug("server closed by error");
            reject(err);
          } else {
            resolve();
          }
        });
      });

      await shutdownPromise.catch((e) => {
        debug("An error occurred while shutdown Http Adapter", e);
      });
    }
    return Promise.resolve();
  }

  /**
   * Check server is listening
   *
   * @return {boolean}
   */
  isListening(): boolean {
    return this.isListened;
  }

  /**
   * Request Listener
   * @param {object} req Request
   * @param {object} res Response
   *
   * @return {Promise}
   */
  private requestListener: http.RequestListener<
    typeof IncomingMessage,
    typeof ServerResponse
  > = async (req, res) => {
    const request = new HttpRequestExtend(req);
    const response = new HttpResponseExtend(res);
    if (URL.parse(req.url, true).pathname !== this.config.pathname) {
      res.writeHead(404).write("<h1>Not Found</h1>");
      res.end();
      return;
    }
    debug("new request from from", request.getClientId());
    let baseError: Error;
    const body = await new Promise<
      Partial<JRPCRequestBodyInterface> | Partial<JRPCRequestBodyInterface>[]
    >((resolve, reject) => {
      let data = "";
      req.on("error", (e) => {
        reject(e);
      });
      req.on("data", (chunk) => {
        data += chunk.toString();
      });
      req.on("end", () => {
        let parsedBody:
          | Partial<JRPCRequestBodyInterface>
          | Partial<JRPCRequestBodyInterface>[];
        try {
          parsedBody = JSON.parse(data);
        } catch (e) {
          reject(e);
          return;
        }
        resolve(parsedBody);
      });
    }).catch((e) => {
      baseError = e;
    });
    Object.defineProperty(req, "body", {
      writable: false,
      value: body,
    });

    debug("handling new request");
    await this.newRequest(request, response, baseError);
  };
}
