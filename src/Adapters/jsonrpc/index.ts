import {IAdapter, IErrorInline, IErrorResponse, IResponse} from '../types';
import {RpcError, RpcErrorCode, RpcErrorMessage} from '../../Core/Errors';
import {IJSONRPCMethod} from './types';
import {TDataPromise} from '../../types';

export default class JSONRPC implements IAdapter {

    async checkRequest(data: IJSONRPCMethod | Array<IJSONRPCMethod>): Promise<Array<IJSONRPCMethod>> {
        const checkKeys = (item: IJSONRPCMethod) => {
            const keys = Object.keys(item);
            const check = keys.indexOf('method') > -1 && keys.indexOf('params') > -1 && keys.indexOf('id') > -1;

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

    convert(data: Array<TDataPromise<IJSONRPCMethod>>): Array<IResponse | IErrorResponse> {
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
            if (item.data instanceof Error) {
                if (!(item.data instanceof RpcError)) {
                    item.data = RpcError.fromJSON({
                        code: RpcErrorCode.INTERNAL_ERROR,
                        message: RpcErrorMessage.INTERNAL_ERROR,
                        parent: item.data,
                    });
                }
                return {
                    id: item.method.id,
                    result: null,
                    error: convertErr(item.data),
                };
            }

            return {
                id: item.method.id,
                result: item.data,
            };
        });
    }
}