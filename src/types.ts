export interface IRPCServerConfig {
    bind: string;
    port: number;
    path?: string;
}

export interface IListenResponse {
    bind: string;
    port: number;
    path: string;
}