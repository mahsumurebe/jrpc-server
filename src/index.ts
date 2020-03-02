import {IListenResponse, IRPCServerConfig} from './types';
import * as core from 'express-serve-static-core';
import express from 'express';
import {RpcError, RpcErrorCode, RpcErrorMessage} from './Core/Errors';
import {IAdapters, IMethod} from './Adapters/types';
import Methods from './Core/Methods';
import * as http from 'http';
import {EventEmitter} from 'events';

const configDefault: IRPCServerConfig = {
    bind: '127.0.0.1',
    port: 8999,
    path: '/',
};
import bodyParser = require('body-parser');

export default class RPCServer<Adapter extends IAdapters> extends EventEmitter {
    public methods = new Methods();
    protected server: core.Express;
    private httpServer: http.Server;

    constructor(public readonly config: IRPCServerConfig = configDefault, public readonly adapter: Adapter) {
        super();
        this.config.path = this.config.path || '/';
        this.server = express();

        this.server.set('trust proxy', true);
        this.server.use(bodyParser.urlencoded({extended: false}));
        this.server.use(bodyParser.json());
        this.server
            .use((req, res, next) => {
                if (req.method.toUpperCase() !== 'POST') {
                    const error = RpcError.fromJSON({
                        code: RpcErrorCode.PARSE_ERROR,
                        message: 'Server only allows POST requests.',
                    });
                    res
                        .send(error)
                        .end();
                }
                next();
            });
        this.server
            .use((err, req, res, next) => {
                if (err instanceof SyntaxError) {
                    next(RpcError.fromJSON({
                        code: RpcErrorCode.PARSE_ERROR,
                        message: RpcErrorMessage.PARSE_ERROR,
                    }));
                } else {
                    next(err, req, res);
                }
            });
        this.server
            .use((req, res, next) => {
                if (!req.body) {
                    return next(RpcError.fromJSON({
                        code: RpcErrorCode.INVALID_PARAMS,
                        message: RpcErrorMessage.INVALID_PARAMS,
                    }));
                }

            });
    }

    private registerPaths() {
        const self = this;

        // Allow only POST requests.
        this.server
            .post(this.config.path, (req, res) => {
                this.adapter
                    .parseRequest(req.body)
                    .then(request => {
                        if (!(request instanceof Array)) {
                            request = [request];
                        }
                        return request;
                    })
                    .then<Array<IMethod>>(methods => {
                        const promises: Array<Promise<any>> = [];
                        for (const method of methods) {
                            const promise = self
                                .methods
                                .call(method.method, ...method.params)
                                .then(data => {
                                    self.emit('response', data, method.method, method.params);
                                    res.send(data)
                                        .end();
                                })
                                .catch(e => {
                                    self.emit('response', e, method.method, method.params);
                                    throw e;
                                });
                            promises.push(promise);
                        }
                        return Promise.all(promises);

                    })
                    .catch(e => {
                        if (!(e instanceof RpcError)) {
                            e = RpcError.fromJSON({
                                code: RpcErrorCode.INTERNAL_ERROR,
                                message: RpcErrorMessage.INTERNAL_ERROR,
                            });
                        }
                        res.send(e)
                            .status(e.httpStatusCode || 500)
                            .end();
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
                self.httpServer = this.server.listen(() => {
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