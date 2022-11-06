import { WebSocket, WebSocketServer } from "ws";
import { WebsocketAdapterConfigInterface } from "./interfaces";
import { AdapterAbstract } from "../../core";
import { HttpAdapter } from "../http";
import { WebsocketRequestExtend, WebsocketResponseExtend } from "./extends";

export * from "./interfaces";

const debug = require("debug")("jrpc:server:adapters:websocket");

/**
 * Websocket Server Adapter for JSONRPC Server
 *
 *
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @licence MIT
 *
 * @example
 * // Create adapter for Websocket Connection
 * const adapter = new HttpAdapter({
 *   hostname: "localhost",
 *   port: 3000,
 * })
 *
 * @example
 * // Create adapter for WSS Connection
 * const adapter = new HttpAdapter({
 *   hostname: "localhost",
 *   port: 3000,
 *   ssl: {
 *     certFile: "/path/to/site.cert",
 *     privateKey: "/path/to/site.key",
 *   },
 * })
 */
export class WebsocketAdapter extends AdapterAbstract {
  public httpAdapter: HttpAdapter;

  protected server: WebSocketServer;

  protected readonly config: WebsocketAdapterConfigInterface;

  constructor(config: HttpAdapter);
  constructor(config: WebsocketAdapterConfigInterface);
  constructor(arg: HttpAdapter | WebsocketAdapterConfigInterface) {
    super();
    const defaultConfig: Partial<WebsocketAdapterConfigInterface> = {
      hostname: "127.0.0.1",
      pathname: "/",
      keepAlive: false,
      keepAliveInitialDelay: 0,
    };
    if (arg instanceof HttpAdapter) {
      debug("create instance with http adapter");
      this.httpAdapter = arg;
      this.config = {
        ...(defaultConfig as WebsocketAdapterConfigInterface),
        ...this.httpAdapter.config,
      };
      this.httpAdapter.register(async (httpRequest, httpResponse) => {
        if ("ws" in httpRequest.request) {
          return Promise.resolve();
        }
        return this.registerFn(httpRequest, httpResponse);
      });
    } else {
      debug("create instance with config");
      this.config = {
        ...(defaultConfig as WebsocketAdapterConfigInterface),
        ...arg,
      };
      this.httpAdapter = new HttpAdapter(arg);

      this.httpAdapter.middleware.addFirst(
        async (error, httpRequest, httpResponse) => {
          debug("destroying http request");
          httpResponse.response.writeHead(503).end();
        }
      );
    }

    this.server = new WebSocketServer({
      server: this.httpAdapter.server,
    });

    this.server.on("error", (err) => {
      debug("error", err);
    });
    this.server.on("connection", (socket: WebSocket, req) => {
      debug("client connect");
      socket.on("close", (code: number, reason: Buffer) => {
        debug(`client closed with ${code} ${reason.toString("utf8")}`);
      });
      socket.on("error", (err) => {
        debug("socket error", err);
      });
      socket.on("message", async (data) => {
        const response = new WebsocketResponseExtend(socket);
        const request = new WebsocketRequestExtend(req, data.toString());
        debug("new request from from", request.getClientId());

        debug("handling new request");
        await this.newRequest(
          request,
          response,
          !request.getBody() ? new SyntaxError() : undefined
        );
      });
    });
    this.server.on("close", () => {
      debug("closed");
    });
  }

  /**
   * Check server is listening
   *
   * @return {boolean}
   */
  isListening(): boolean {
    return this.httpAdapter.isListening();
  }

  /**
   * Listen server
   *
   * @return {Promise<void>}
   */
  listen(): Promise<void> {
    if (this.isListening()) {
      return Promise.resolve();
    }
    return this.httpAdapter.listen();
  }

  /**
   * Listen server
   *
   * @return {Promise<void>}
   */
  shutdown(): Promise<void> {
    if (!this.isListening()) {
      return Promise.resolve();
    }

    this.server.clients.forEach((client) => {
      // close client with no problem
      debug("closing client");
      client.close(1000);
    });
    this.server.close();
    return this.httpAdapter.shutdown();
  }
}
