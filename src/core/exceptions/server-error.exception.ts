import { JRPCExceptionAbstract } from "./abstracts";
import {
  CONST_RPC_ERROR_CODE_SERVER_ERROR,
  CONST_RPC_ERROR_MESSAGE_SERVER_ERROR,
} from "../constants";

/**
 * Server Error Exception
 *
 * @extends JRPCExceptionAbstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class ServerErrorException extends JRPCExceptionAbstract {
  constructor(data?: any, message?: string) {
    super(
      CONST_RPC_ERROR_CODE_SERVER_ERROR,
      message ?? CONST_RPC_ERROR_MESSAGE_SERVER_ERROR,
      data
    );
  }
}
