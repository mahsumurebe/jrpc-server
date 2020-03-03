export interface IMethod {
    id?: number
    jsonrpc: '2.0';
    method: string;
    params: Array<any>
}

export interface IErrorInline {
    code?: number;
    message: string;
    data?: IErrorInline
    stack?: string
}

export interface IErrorResponse {
    id: number;
    error: IErrorInline,
    result?: null
}

export interface IResponse<R = any> {
    id: number;
    result: R
}

export interface IAdapter {
    checkRequest(data: IMethod | Array<IMethod>): Promise<Array<IMethod>>;

    convert(data: any, method?: IMethod);
}