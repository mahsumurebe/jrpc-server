import { JRPCExceptionAbstract } from "./abstracts";
import {
  CONST_RPC_ERROR_CODE_INVALID_PARAMS,
  CONST_RPC_ERROR_MESSAGE_INVALID_PARAMS,
} from "../constants";

/**
 * Invalid Params Exception
 *
 * @extends JRPCExceptionAbstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class InvalidParamsException extends JRPCExceptionAbstract {
  constructor(data?: any, message?: string) {
    super(
      CONST_RPC_ERROR_CODE_INVALID_PARAMS,
      message ?? CONST_RPC_ERROR_MESSAGE_INVALID_PARAMS,
      data
    );
  }
}
