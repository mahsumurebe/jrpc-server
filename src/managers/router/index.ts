import {
  InvalidRequestException,
  JRPCErrorResponseBodyInterface,
  JRPCExceptionAbstract,
  JRPCRequestBodyInterface,
  TypeJRPCResponse,
} from "../../core";
import { RouterManagerAbstract } from "../abstracts";

export * from "./helpers";
export * from "./interfaces";

const debug = require("debug")("jrpc:server:manager:router");

export class RouterManager extends RouterManagerAbstract {
  async processMethod(
    jsonBody: JRPCRequestBodyInterface
  ): Promise<TypeJRPCResponse> {
    let error: JRPCExceptionAbstract;
    debug(`processing ${jsonBody.method} method`);
    try {
      const data = await this.methodManager.call(
        jsonBody.method,
        jsonBody.params
      );
      debug(`${jsonBody.method} method processing successful`);
      return {
        id: jsonBody.id,
        jsonrpc: jsonBody.jsonrpc,
        result: data ?? null,
      };
    } catch (e) {
      error = e;
    }
    debug(
      `${jsonBody.method} method processing finished with error`,
      error.toString()
    );

    return this.generateErrorResponse(jsonBody.id, error);
  }

  request(
    body:
      | Partial<JRPCRequestBodyInterface>
      | Partial<JRPCRequestBodyInterface>[]
  ): Promise<TypeJRPCResponse | TypeJRPCResponse[]> {
    debug("new request body", body);

    const responseList: Promise<TypeJRPCResponse>[] = [];

    if (body) {
      if (Array.isArray(body)) {
        if (body.length > 0) {
          debug(`processing batch request. req count: ${body.length}`);
          body.forEach((jsonBodyElement) => {
            const validation = this.config.validator(
              jsonBodyElement,
              this.config
            );
            if (validation === true) {
              const promise = this.processMethod(jsonBodyElement as any);
              if (
                typeof jsonBodyElement.id === "undefined" ||
                jsonBodyElement.id === null
              ) {
                promise.catch((e) => {
                  debug("An error occurred while notification request", e);
                });
              } else {
                responseList.push(promise);
              }
            } else {
              responseList.push(
                Promise.resolve<JRPCErrorResponseBodyInterface>(
                  this.generateErrorResponse(jsonBodyElement.id, validation)
                )
              );
            }
          });
          return Promise.all<TypeJRPCResponse>(responseList);
        }
      } else {
        const validation = this.config.validator(body, this.config);
        if (validation === true) {
          return this.processMethod(body as any);
        }
        return Promise.resolve<JRPCErrorResponseBodyInterface>(
          this.generateErrorResponse(body.id, validation)
        );
      }
    }

    debug(`valid body was not sent`);
    return Promise.resolve<JRPCErrorResponseBodyInterface>(
      this.generateErrorResponse(null, new InvalidRequestException())
    );
  }
}
