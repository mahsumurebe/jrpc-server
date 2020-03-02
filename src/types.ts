import {IMethod} from './Adapters/types';

export interface IRPCServerConfig {
    hostname: string;
    port: number;
    pathname?: string;
    https?: {
        use: boolean;
        certFile: string;
        privateKey: string;
    }
}

export interface IListenResponse {
    scheme: 'http' | 'https';
    hostname: string;
    port: number;
    pathname: string;

    toString(): string;
}

export type TDataPromise<T = IMethod> = { method: T, data: any }
