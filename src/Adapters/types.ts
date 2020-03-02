export interface IMethod {
    method: string;
    params: Array<any>
}

export interface IAdapters {
    parseRequest(data: string): Promise<IMethod | Array<IMethod>>

    validRequest(data: string): Promise<boolean>;
}