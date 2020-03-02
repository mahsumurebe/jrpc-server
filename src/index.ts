import {IListenResponse, IRPCServerConfig} from './types';
import * as core from 'express-serve-static-core';
import express, {Request} from 'express';
import {RpcError, RpcErrorCode, RpcErrorMessage} from './Core/Errors';
import {IAdapter, IMethod} from './Adapters/types';
import Methods from './Core/Methods';
import * as http from 'http';
import {EventEmitter} from 'events';
import bodyParser from 'body-parser';
import JSONRPC from './Adapters/jsonrpc';

const configDefault: IRPCServerConfig = {
    bind: '127.0.0.1',
    port: 8999,
    path: '/',
};

export default class RPCServer extends EventEmitter {
    public adapter: IAdapter = new JSONRPC();
    public methods = new Methods();
    protected server: core.Express;
    private httpServer: http.Server;

    constructor(public readonly config: IRPCServerConfig = configDefault) {
        super();
        const self = this;
        self.config.path = self.config.path || '/';
        self.server = express();


        self.server
            .use((req, res, next) => {
                if (req.method.toUpperCase() !== 'POST') {
                    self.sendOutput(res, RpcError.fromJSON({
                        code: RpcErrorCode.PARSE_ERROR,
                        message: 'Server only allows POST requests.',
                    }));
                    return;
                }
                next();
            });
        self.server
            .use(bodyParser.json());
        self.server.use((err, req, res: core.Response, next) => {
            let body = undefined;
            if (!!err) {
                const errKeys = Object.keys(err);
                if (errKeys.indexOf('body')) {
                    body = err['body'];
                }
            }
            if (err instanceof SyntaxError) {
                this.sendOutput(res, RpcError.fromJSON({
                    code: RpcErrorCode.INVALID_REQUEST,
                    message: RpcErrorMessage.INVALID_REQUEST,
                    parent: err,
                    data: body,
                }));
                return;
            } else {
                next(err, req, res);
            }
        });
        self.server
            .use((req, res, next) => {
                if (!req.body) {
                    this.sendOutput(res, RpcError.fromJSON({
                        code: RpcErrorCode.INVALID_REQUEST,
                        message: RpcErrorMessage.INVALID_REQUEST,
                    }));
                    return;
                }
                next();
            });
    }

    private sendOutput(res: core.Response, data: any, method?: IMethod) {
        if (data instanceof Error) {
            if (!(data instanceof RpcError)) {
                data = RpcError.fromJSON({
                    code: RpcErrorCode.INTERNAL_ERROR,
                    message: RpcErrorMessage.INTERNAL_ERROR,
                    parent: data,
                });
            }
            if (data instanceof RpcError) {
                res.status(data.httpStatusCode);
            }
        }
        res.send(this.adapter.convert(data, method))
            .end();
    }

    private registerPaths() {
        const self = this;
        // Allow only POST requests.
        this.server
            .post(this.config.path, (req: Request<any>, res) => {
                this.adapter
                    .checkRequest(req.body)
                    .then<Array<IMethod>>(methods => {
                        const promises: Array<Promise<any>> = [];
                        for (const method of methods) {
                            const params = method.params instanceof Array ? method.params : [method.params];
                            const promise = self
                                .methods
                                .call(method.method, ...params)
                                .then(data => {
                                    self.emit('response', data, method.method, method.params);
                                    self.sendOutput(res, data, method);
                                })
                                .catch(e => {
                                    self.emit('response', e, method.method, method.params);
                                    self.sendOutput(res, e, method);
                                    throw e;
                                });
                            promises.push(promise);
                        }
                        return Promise.all(promises);

                    })
                    .catch(e => {
                        this.sendOutput(res, e);
                    });
            });
    }

    listen(): Promise<IListenResponse> {
        const self = this;
        const addressInfo: IListenResponse = {
            bind: this.config.bind,
            port: this.config.port,
            path: this.config.path,
        };
        return new Promise<IListenResponse>((resolve, reject) => {
            try {
                self.httpServer = this.server.listen(this.config.port, this.config.bind, () => {
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        })
            .then(() => {
                self.emit('listening', addressInfo);
                this.registerPaths();
                return addressInfo as IListenResponse;
            })
            .catch(e => {
                const error = RpcError.fromJSON({
                    code: RpcErrorCode.SERVER_ERROR,
                    message: RpcErrorMessage.SERVER_ERROR,
                    data: addressInfo,
                    parent: e,
                });
                self.emit('error', error);
                throw error;
            });
    }

    close(): Promise<true> {
        const self = this;
        return new Promise<true>((resolve, reject) => {
            this.httpServer.close(err => {
                if (!err) {
                    resolve();
                    return;
                }
                reject(err);
            });
        }).then<true>(() => {
            self.emit('close');
            return true;
        })
            .catch(e => {
                self.emit('error', e);
                throw e;
            });
    }


    // Event Emitter Typings
    addListener(event: 'error', listener: (error: RpcError) => void): this;
    addListener(event: 'response', listener: (data: any, method: string, params: Array<any>) => void): this;
    addListener(event: 'response', listener: (error: RpcError, method: string, params: Array<any>) => void): this;
    addListener(event: 'request', listener: (method: string, params: Array<any>) => void): this;
    addListener(event: 'listening', listener: (address: IListenResponse) => void): this;
    addListener(event: 'close', listener: () => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.addListener(event, listener);
    }

    on(event: 'error', listener: (error: RpcError) => void): this;
    on(event: 'response', listener: (data: any, method: string, params: Array<any>) => void): this;
    on(event: 'response', listener: (error: RpcError, method: string, params: Array<any>) => void): this;
    on(event: 'request', listener: (method: string, params: Array<any>) => void): this;
    on(event: 'listening', listener: (address: IListenResponse) => void): this;
    on(event: 'close', listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.on(event, listener);
    }

    once(event: 'error', listener: (error: RpcError) => void): this;
    once(event: 'response', listener: (data: any, method: string, params: Array<any>) => void): this;
    once(event: 'response', listener: (error: RpcError, method: string, params: Array<any>) => void): this;
    once(event: 'request', listener: (method: string, params: Array<any>) => void): this;
    once(event: 'listening', listener: (address: IListenResponse) => void): this;
    once(event: 'close', listener: () => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.once(event, listener);
    }

    removeListener(event: 'error', listener: (error: RpcError) => void): this;
    removeListener(event: 'response', listener: (data: any, method: string, params: Array<any>) => void): this;
    removeListener(event: 'response', listener: (error: RpcError, method: string, params: Array<any>) => void): this;
    removeListener(event: 'request', listener: (method: string, params: Array<any>) => void): this;
    removeListener(event: 'listening', listener: (address: IListenResponse) => void): this;
    removeListener(event: 'close', listener: () => void): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.removeListener(event, listener);
    }

    off(event: 'error', listener: (error: RpcError) => void): this;
    off(event: 'response', listener: (data: any, method: string, params: Array<any>) => void): this;
    off(event: 'response', listener: (error: RpcError, method: string, params: Array<any>) => void): this;
    off(event: 'request', listener: (method: string, params: Array<any>) => void): this;
    off(event: 'listening', listener: (address: IListenResponse) => void): this;
    off(event: 'close', listener: () => void): this;
    off(event: string | symbol, listener: (...args: any[]) => void): this {
        return super.off(event, listener);
    }

    removeAllListeners(event: 'error'): this;
    removeAllListeners(event: 'response'): this;
    removeAllListeners(event: 'request'): this;
    removeAllListeners(event: 'listening'): this;
    removeAllListeners(event: 'close'): this;
    removeAllListeners(event?: string | symbol): this {
        return super.removeAllListeners(event);
    }

    emit(event: 'error', error: RpcError): boolean;
    emit(event: 'response', e: RpcError, method: string, params: Array<any>): boolean;
    emit(event: 'response', data: any, method: string, params: Array<any>): boolean;
    emit(event: 'request', method: string, params: Array<any>): boolean;
    emit(event: 'listening', address: IListenResponse): boolean;
    emit(event: 'close'): boolean;
    emit(event: string | symbol, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}