import {
  AdapterAbstract,
  exitHandler,
  JRPCServerOptionsInterface,
  RequestExtendAbstract,
  ResponseExtendAbstract,
} from "./core";
import {
  MethodManagerAbstract,
  RouterManagerAbstract,
} from "./managers/abstracts";
import { MethodManager, RouterManager, validator } from "./managers";

export * from "./adapters";
export * from "./managers";

const debug = require("debug")("jrpc:server");

/**
 * JSONRPC 2.0 NodeJS Server written in TypeScript
 *
 * @author Mahsum UREBE <info@mahsumurebe.com>
 * @licence MIT
 *
 * @example
 * // Websocket Adapter
 * const server = await new JRPCServer(
 *   new WebsocketAdapter({
 *     hostname: "localhost",
 *     port: 3000,
 *   })
 * );
 *
 * @example
 * // Http Adapter
 * const server = await new JRPCServer(
 *   new HttpAdapter({
 *     hostname: "localhost",
 *     port: 3000,
 *   })
 * );
 *
 * @example
 * // Allow http request with websocket
 * const server = await new JRPCServer(
 *   new WebsocketAdapter(
 *     new HttpAdapter({
 *       hostname: "localhost",
 *       port: 3000,
 *     })
 *   )
 * );
 */
export class JRPCServer {
  /**
   * Method Manager
   *
   * @type {MethodManagerAbstract}
   */
  public readonly methods: MethodManagerAbstract;

  /**
   * Router Manager
   *
   * @type {RouterManagerAbstract}
   * @protected
   */
  protected readonly routerManager: RouterManagerAbstract;

  constructor(
    protected readonly adapter: AdapterAbstract,
    options?: JRPCServerOptionsInterface
  ) {
    debug("initializing app");
    this.methods = options?.methodManager ?? new MethodManager();
    this.routerManager =
      options.routerManager ??
      new RouterManager(this.methods, {
        paramType: options?.paramType ?? "array",
        validator: options?.validator ?? validator,
      });

    debug("setup exit handler");
    exitHandler(async (opt, exitCode) => {
      if (opt.cleanup) {
        debug("clean");
      }
      if (exitCode || exitCode === 0) {
        if (exitCode instanceof Error) {
          debug(`Exit with error`, exitCode);
        } else {
          debug(`Exit Code: ${exitCode}`);
        }
      }
      if (opt.exit) {
        await this.shutdown();
        if (exitCode instanceof Error) {
          process.exit(1);
        }
        process.exit(exitCode);
      }
    });

    debug("register adapter");
    this.adapter.register(
      async (req?: RequestExtendAbstract, res?: ResponseExtendAbstract) => {
        const body = req.getBody();
        const responseData = this.routerManager.request(body);
        if (!Array.isArray(body)) {
          if (typeof body.id === "undefined" || body.id === null) {
            res.send(); // send empty response
            return;
          }
        }
        res.send(await responseData);
      }
    );
  }

  /**
   * Start Server
   *
   * @return {Promise<void>}
   */
  async start() {
    debug("starting");
    return this.adapter.listen();
  }

  /**
   * Check server is up
   *
   * @return {Promise<boolean>}
   */
  isListening() {
    return this.adapter.isListening();
  }

  /**
   * Shutdown server
   *
   * @return {Promise<void>}
   */
  async shutdown() {
    if (this.adapter.isListening()) {
      debug("shutdown");
      await this.adapter.shutdown().catch((e) => {
        debug("an error occurred while shutdown adapter", e);
      });
    } else {
      debug("server is not listening");
    }
  }
}
