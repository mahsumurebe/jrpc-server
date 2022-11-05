/**
 * Returns HTTP Status Code By RPC Error Code
 *
 * @param {number} code RPC Error Code
 * @return {number} HTTP Status Code
 */
import {
  CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
  CONST_RPC_ERROR_CODE_INVALID_PARAMS,
  CONST_RPC_ERROR_CODE_INVALID_REQUEST,
  CONST_RPC_ERROR_CODE_METHOD_NOT_FOUND,
  CONST_RPC_ERROR_CODE_PARSE_ERROR,
  CONST_RPC_ERROR_CODE_SERVER_ERROR,
} from "../../../core";

/**
 * RPC Error Code convert to HTTP Status Code
 * @param {number} code RPC Error Status Code
 *
 * @return {number} HTTP Status Code
 */
export function getHttpStatusCodeByErrCode(code: number) {
  switch (code) {
    case CONST_RPC_ERROR_CODE_INVALID_REQUEST:
      return 405;
    case CONST_RPC_ERROR_CODE_METHOD_NOT_FOUND:
      return 404;
    case CONST_RPC_ERROR_CODE_PARSE_ERROR:
    case CONST_RPC_ERROR_CODE_INVALID_PARAMS:
      return 400;
    case CONST_RPC_ERROR_CODE_INTERNAL_ERROR:
    case CONST_RPC_ERROR_CODE_SERVER_ERROR:
      return 500;
    default:
      return 500;
  }
}
