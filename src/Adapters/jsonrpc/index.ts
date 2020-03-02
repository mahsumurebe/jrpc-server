import {IAdapter, IErrorInline, IErrorResponse, IResponse} from '../types';
import {RpcError, RpcErrorCode, RpcErrorMessage} from '../../Core/Errors';
import {IJSONRPCMethod} from './types';

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

    convert(data: any, method?: IJSONRPCMethod): IResponse | IErrorResponse {
        const id = method && method.id ? method.id : null;
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
        if (data instanceof Error) {
            if (!(data instanceof RpcError)) {
                data = RpcError.fromJSON({
                    code: RpcErrorCode.INTERNAL_ERROR,
                    message: RpcErrorMessage.INTERNAL_ERROR,
                    parent: data,
                });
            }
            return {
                id,
                result: null,
                error: convertErr(data),
            };
        }

        return {
            id,
            result: data,
        };
    }
}