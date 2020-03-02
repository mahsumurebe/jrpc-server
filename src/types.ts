import {IMethod} from './Adapters/types';
import {RequestHandlerParams} from 'express-serve-static-core';

export interface IRPCServerConfig {
    hostname: string;
    port: number;
    pathname?: string;
    https?: {
        use: boolean;
        certFile: string;
        privateKey: string;
    },
    middleware?: Array<RequestHandlerParams>
}

export interface IListenResponse {
    scheme: 'http' | 'https';
    hostname: string;
    port: number;
    pathname: string;

    toString(): string;
}

export type TDataPromise<T = IMethod> = { method: T, data: any }
