export enum RpcErrorCode {
    /**
     * Invalid data was received by the server or An error occurred on the server while parsing the text.
     */
    PARSE_ERROR = -32700,
    /**
     * The sent is not a valid Request object.
     */
    INVALID_REQUEST = -32600,
    /**
     * The method does not exist / is not available.
     */
    METHOD_NOT_FOUND = -32601,
    /**
     * Invalid method parameter(s).
     */
    INVALID_PARAMS = -32602,
    /**
     * Internal RPC error.
     */
    INTERNAL_ERROR = -32603,
    /**
     * Reserved for implementation-defined server-errors.
     */
    SERVER_ERROR = -32000,
}

export enum RpcErrorMessage {
    /**
     * Invalid data was received by the server or An error occurred on the server while parsing the text.
     */
    PARSE_ERROR = 'Invalid params',
    /**
     * The sent is not a valid Request object.
     */
    INVALID_REQUEST = 'Invalid request',
    /**
     * The method does not exist / is not available.
     */
    METHOD_NOT_FOUND = 'Methot not found',
    /**
     * Invalid method parameter(s).
     */
    INVALID_PARAMS = 'Invalid params',
    /**
     * Internal RPC error.
     */
    INTERNAL_ERROR = 'RPC error',
    /**
     * Reserved for implementation-defined server-errors.
     */
    SERVER_ERROR = 'Server error',
}

export enum RpcErrorHttpCode {
    /**
     * Invalid data was received by the server or An error occurred on the server while parsing the text.
     */
    PARSE_ERROR = 500,
    /**
     * The sent is not a valid Request object.
     */
    INVALID_REQUEST = 400,
    /**
     * The method does not exist / is not available.
     */
    METHOD_NOT_FOUND = 404,
    /**
     * Invalid method parameter(s).
     */
    INVALID_PARAMS = 500,
    /**
     * Internal RPC error.
     */
    INTERNAL_ERROR = 500,
    /**
     * Reserved for implementation-defined server-errors.
     */
    SERVER_ERROR = 500,
}

interface RpcErrorJson<T> {
    code: number;
    message: string;
    data?: T;
    parent?: Error;
}

export class RpcError<T = any> extends Error {
    public httpStatusCode = 500;

    constructor(public readonly code: number = RpcErrorCode.INTERNAL_ERROR, public readonly message: string = RpcErrorMessage.INTERNAL_ERROR, public readonly data?: T, public readonly parent?: Error) {
        super(message);
        switch (code) {
            case RpcErrorCode.INVALID_REQUEST:
                this.httpStatusCode = 400;
                break;
            case RpcErrorCode.METHOD_NOT_FOUND:
                this.httpStatusCode = 404;
                break;
        }
    }

    static fromJSON<Q = any>(json: RpcErrorJson<Q>): RpcError<Q> {
        return new RpcError<Q>(json.code, json.message, json.data, json.parent);
    }

    toJSON(): RpcErrorJson<T> {
        return {
            code: this.code,
            data: this.data,
            parent: this.parent,
            message: this.message,
        };
    }
}