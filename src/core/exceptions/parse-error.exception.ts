import { JRPCExceptionAbstract } from "./abstracts";
import {
  CONST_RPC_ERROR_CODE_PARSE_ERROR,
  CONST_RPC_ERROR_MESSAGE_PARSE_ERROR,
} from "../constants";

/**
 * Parse Error Exception
 *
 * @extends JRPCExceptionAbstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class ParseErrorException extends JRPCExceptionAbstract {
  constructor(data?: any, message?: string) {
    super(
      CONST_RPC_ERROR_CODE_PARSE_ERROR,
      message ?? CONST_RPC_ERROR_MESSAGE_PARSE_ERROR,
      data
    );
  }
}
