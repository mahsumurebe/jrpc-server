import {IAdapters} from '../types';
import {RpcError, RpcErrorCode, RpcErrorMessage} from '../../Core/Errors';
import {IJSONRPCMethods} from './types';

export default class JSONRPC implements IAdapters {
    private async parseJSON(data: string): Promise<IJSONRPCMethods | Array<IJSONRPCMethods>> {
        return Promise
            .resolve(() => JSON.parse(data))
            .then(data => data as any)
            .catch(() => {
                throw RpcError.fromJSON({code: RpcErrorCode.PARSE_ERROR, message: RpcErrorMessage.PARSE_ERROR, data});
            });
    }

    async parseRequest(data: string): Promise<IJSONRPCMethods | Array<IJSONRPCMethods>> {
        return this
            .validRequest(data)
            .then(valid => {
                if (!valid) {
                    throw  RpcError.fromJSON({
                        code: RpcErrorCode.INVALID_PARAMS,
                        message: RpcErrorMessage.INVALID_PARAMS,
                    });
                }
                return this.parseJSON(data);
            });
    }

    async validRequest(data: string): Promise<boolean> {
        return this
            .parseJSON(data)
            .then(data => {
                const checkKeys = (item: IJSONRPCMethods) => {
                    const keys = Object.keys(item);
                    return keys.indexOf('method') === -1 || keys.indexOf('params') === -1 || keys.indexOf('id') === -1;
                };
                if (data instanceof Array) {
                    for (const rq of data) {
                        if (!checkKeys(rq)) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return checkKeys(data);
                }
            })
            .catch(() => false);
    }
}