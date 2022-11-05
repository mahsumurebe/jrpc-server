import { JRPCExceptionAbstract } from "./abstracts";
import {
  CONST_RPC_ERROR_CODE_METHOD_NOT_FOUND,
  CONST_RPC_ERROR_MESSAGE_METHOD_NOT_FOUND,
} from "../constants";

/**
 * Method Not Found Exception
 *
 * @extends JRPCExceptionAbstract
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class MethodNotFoundException extends JRPCExceptionAbstract {
  constructor(data?: any, message?: string) {
    super(
      CONST_RPC_ERROR_CODE_METHOD_NOT_FOUND,
      message ?? CONST_RPC_ERROR_MESSAGE_METHOD_NOT_FOUND,
      data
    );
  }
}
