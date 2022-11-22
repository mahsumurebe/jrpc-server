import { JRPCExceptionAbstract } from "./abstracts";
import {
  CONST_RPC_ERROR_CODE_INVALID_REQUEST,
  CONST_RPC_ERROR_MESSAGE_INVALID_REQUEST,
} from "../constants";

/**
 * Invalid Request Exception
 *
 * @extends JRPCExceptionAbstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class InvalidRequestException extends JRPCExceptionAbstract {
  constructor(data?: any, message?: string) {
    super(
      CONST_RPC_ERROR_CODE_INVALID_REQUEST,
      message ?? CONST_RPC_ERROR_MESSAGE_INVALID_REQUEST,
      data
    );
  }
}
