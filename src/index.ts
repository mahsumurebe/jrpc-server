import {IListenResponse, IRPCServerConfig, TDataPromise} from './types';
import * as core from 'express-serve-static-core';
import express, {Request} from 'express';
import {RpcError, RpcErrorCode, RpcErrorMessage} from './Core/Errors';
import {IAdapter} from './Adapters/types';
import Methods from './Core/Methods';
import * as http from 'http';
import * as https from 'https';
import {EventEmitter} from 'events';
import bodyParser from 'body-parser';
import JSONRPC from './Adapters/jsonrpc';

const configDefault: IRPCServerConfig = {
    hostname: '127.0.0.1',
    port: 8999,
    pathname: '/',
    https: {
        use: false,
        certFile: null,
        privateKey: null,
    },
};

export default class RPCServer extends EventEmitter {
    public adapter: IAdapter = new JSONRPC();
    public methods = new Methods();
    protected expressServer: core.Express;
    private server: http.Server | https.Server;

    constructor(public config?: IRPCServerConfig) {
        super();
        const self = this;
        self.config = {
            ...configDefault,
            ...self.config,
        };

        self.expressServer = express();

        if (self.config.https.use) {
            if (!self.config.https.certFile) {
                throw new Error('Certificate file is not defined.');
            } else if (!self.config.https.privateKey) {
                throw new Error('Private Key is not defined.');
            }


            const fs = require('fs');

            if (!fs.existsSync(self.config.https.certFile)) {
                throw new Error('Certificate file not found.');
            } else if (!fs.existsSync(self.config.https.privateKey)) {
                throw new Error('Private Key file not found.');
            }

            const privateKey = fs.readFileSync(self.config.https.privateKey, 'utf8');
            const certificate = fs.readFileSync(self.config.https.certFile, 'utf8');

            const credentials = {key: privateKey, cert: certificate};

            this.server = https.createServer(credentials, this.expressServer);
        } else {
            this.server = http.createServer(this.expressServer);
        }

        self.expressServer
            .use((req, res, next) => {
                // Allow only POST requests.

                if (req.method.toUpperCase() !== 'POST') {
                    self.sendOutput(res, [
                        {
                            data: RpcError.fromJSON({
                                code: RpcErrorCode.PARSE_ERROR,
                                message: 'Server only allows POST requests.',
                            }),
                            method: null,
                        },
                    ]);
                    return;
                }
                next();
            });
        self.expressServer
            .use(bodyParser.json());
        self.expressServer.use((err, req, res: core.Response, next) => {
            let body = undefined;
            if (!!err) {
                const errKeys = Object.keys(err);
                if (errKeys.indexOf('body')) {
                    body = err['body'];
                }
            }
            if (err instanceof SyntaxError) {
                this.sendOutput(res, [
                    {
                        data: RpcError.fromJSON({
                            code: RpcErrorCode.INVALID_REQUEST,
                            message: RpcErrorMessage.INVALID_REQUEST,
                            parent: err,
                            data: body,
                        }),
                        method: null,
                    },
                ]);
                return;
            } else {
                next(err, req, res);
            }
        });
        self.expressServer
            .use((req, res, next) => {
                if (!req.body) {
                    this.sendOutput(res, [
                        {
                            data: RpcError.fromJSON({
                                code: RpcErrorCode.INVALID_REQUEST,
                                message: RpcErrorMessage.INVALID_REQUEST,
                            }),
                            method: null,
                        },
                    ]);
                    return;
                }
                next();
            });
    }

    private sendOutput(res: core.Response, responses: Array<TDataPromise>) {
        for (let item of responses) {
            if (item.data instanceof Error) {
                if (!(item.data instanceof RpcError)) {
                    item.data = RpcError.fromJSON({
                        code: RpcErrorCode.INTERNAL_ERROR,
                        message: RpcErrorMessage.INTERNAL_ERROR,
                        parent: item.data,
                    });
                }
                if (item.data instanceof RpcError) {
                    res.status(item.data.httpStatusCode);
                }
            }
        }
        const converted = this.adapter.convert(responses);
        res.send(converted.length === 1 ? converted[0] : converted)
            .end();
    }

    private registerPaths() {
        const self = this;
        this.expressServer
            .post('/' + self.config.pathname.replace(/^[\/|\\]+/g, ''), (req: Request<any>, res) => {
                this.adapter
                    .checkRequest(req.body)
                    .then(methods => {
                        const promises: Array<Promise<any>> = [];
                        for (const method of methods) {
                            const params = method.params instanceof Array ? method.params : [method.params];
                            method.params = params;
                            const promise = self
                                .methods
                                .call(method.method, ...params)
                                .then(data => {
                                    return {
                                        method,
                                        data,
                                    };
                                })
                                .catch(e => {
                                    self.emit('response', e, method.method, method.params);
                                    self.sendOutput(res, [
                                        {
                                            data: e,
                                            method,
                                        },
                                    ]);
                                    throw e;
                                });
                            promises.push(promise);
                        }
                        return Promise.all<TDataPromise>(promises);
                    })
                    .then(data => {
                        if (!data.length) {
                            self.emit('response', data);
                            return self.sendOutput(res, null);
                        }
                        if (data.length === 1) {
                            const item = data[0];
                            self.emit('response', data, item.method.method, item.method.params);
                            return self.sendOutput(res, data);
                        }
                        self.emit('response', data);
                        self.sendOutput(res, data);
                    })
                    .catch(e => {
                        this.sendOutput(res, e);
                    });
            });
    }

    listen(): Promise<IListenResponse> {
        const self = this;
        const addressInfo: IListenResponse = {
            hostname: this.config.hostname,
            port: this.config.port,
            pathname: this.config.pathname,
            scheme: this.config.https.use ? 'https' : 'http',
            toString(): string {
                return `${this.scheme}://${this.hostname}:${this.port}/${(this.pathname || '/').replace(/^[\/|\\]+/g, '')}`;
            },
        };
        return new Promise<IListenResponse>((resolve, reject) => {
            try {
                self.server = this.server.listen(this.config.port, this.config.hostname, () => {
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
            this.server.close(err => {
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
    emit(event: 'response', e: RpcError, method?: string, params?: Array<any>): boolean;
    emit(event: 'response', data: TDataPromise): boolean;
    emit(event: 'response', data: any, method?: string, params?: Array<any>): boolean;
    emit(event: 'request', method: string, params: Array<any>): boolean;
    emit(event: 'listening', address: IListenResponse): boolean;
    emit(event: 'close'): boolean;
    emit(event: string | symbol, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}