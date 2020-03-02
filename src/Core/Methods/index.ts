import {TMethodCallback, TMethods} from './types';
import {RpcError, RpcErrorCode, RpcErrorMessage} from '../Errors';

export default class Methods {
    methods: TMethods = {};

    add(method: string, fn: TMethodCallback) {
        this.methods[method] = fn;
        return this;
    }

    names(): Array<string> {
        return Object.keys(this.methods);
    }

    exists(method: string): boolean {
        return this.names()
            .indexOf(method) >= -1;
    }

    call<T = any>(method: string, ...args: any): Promise<T> {
        if (!this.exists(method)) {
            throw RpcError.fromJSON({
                code: RpcErrorCode.METHOD_NOT_FOUND,
                message: RpcErrorMessage.METHOD_NOT_FOUND,
            });
        }

        return new Promise<T>((resolve, reject) => {
            const fn = this.methods[method];
            try {
                resolve(fn(...args));
            } catch (e) {
                if (!(e instanceof RpcError)) {
                    e = RpcError.fromJSON({
                        code: RpcErrorCode.INTERNAL_ERROR,
                        message: RpcErrorMessage.INTERNAL_ERROR,
                        data: {
                            method,
                            params: args,
                        },
                        parent: e,
                    });
                }
                reject(e);
            }
        });
    }
}