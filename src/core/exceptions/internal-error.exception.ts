import { JRPCExceptionAbstract } from "./abstracts";
import {
  CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
  CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
} from "../constants";

/**
 * Internal Error Exception
 *
 * @extends JRPCExceptionAbstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class InternalErrorException extends JRPCExceptionAbstract {
  constructor(data?: any, message?: string) {
    super(
      CONST_RPC_ERROR_CODE_INTERNAL_ERROR,
      message ?? CONST_RPC_ERROR_MESSAGE_INTERNAL_ERROR,
      data
    );
  }
}
