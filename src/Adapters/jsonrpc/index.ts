import {IAdapter, IErrorInline, IErrorResponse, IMethod, IResponse} from '../types';
import {RpcError, RpcErrorCode, RpcErrorMessage} from '../../Core/Errors';
import {TDataPromise} from '../../types';

export default class JSONRPC implements IAdapter {

    async checkRequest(data: IMethod | Array<IMethod>): Promise<Array<IMethod>> {
        const checkKeys = (item: IMethod) => {
            const keys = Object.keys(item);
            const check = keys.indexOf('method') > -1
                && keys.indexOf('params') > -1
                && keys.indexOf('jsonrpc') > -1
                && item.jsonrpc === '2.0';

            if (!check) {
                throw RpcError.fromJSON({
                    code: RpcErrorCode.INVALID_PARAMS,
                    message: RpcErrorMessage.INVALID_PARAMS,
                });
            }

        };
        if (data instanceof Array) {
            for (const rq of data) {
                checkKeys(rq);
            }
            return data;
        } else {
            checkKeys(data);
            return [data];
        }
    }

    convert(data: Array<TDataPromise>): Array<IResponse | IErrorResponse> {
        const convertErr = (e: RpcError | Error): IErrorInline => {
            const out: IErrorInline = {
                message: null,
            };
            if (e instanceof RpcError) {
                if (e.parent) {
                    out.data = convertErr(e.parent);
                }
                out.code = e.code;
            } else if (e.stack) {
                out.stack = e.stack;
            }

            out.message = e.message;

            return out;
        };

        return data.map(item => {
            const id = item.method && item.method.id ? item.method.id : null;
            const jsonrpc = item.method && item.method.jsonrpc ? item.method.jsonrpc : '2.0';
            if (item.data instanceof Error) {
                if (!(item.data instanceof RpcError)) {
                    item.data = RpcError.fromJSON({
                        code: RpcErrorCode.INTERNAL_ERROR,
                        message: RpcErrorMessage.INTERNAL_ERROR,
                        parent: item.data,
                    });
                }
                return {
                    id,
                    jsonrpc,
                    error: convertErr(item.data),
                };
            }

            return {
                id,
                jsonrpc,
                result: item.data,
            };
        });
    }
}