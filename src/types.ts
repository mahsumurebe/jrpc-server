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