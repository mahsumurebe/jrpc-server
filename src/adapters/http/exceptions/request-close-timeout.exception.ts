import { JRPCServerBaseException } from "../../../core";

/**
 * Request Close Timeout Exception
 *
 * @licence MIT
 * @author Mahsum UREBE <info@mahsumurebe.com>
 */
export class RequestCloseTimeoutException extends JRPCServerBaseException {
  constructor() {
    super("Request Close Timeout");
  }
}
