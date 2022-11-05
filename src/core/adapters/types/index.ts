import { JRPCExceptionAbstract } from "../../exceptions";
import { RequestExtendAbstract, ResponseExtendAbstract } from "../abstracts";

export type TypeNextFunction = (error?: Error) => void;

export type TypeMiddlewareFn<
  Request extends RequestExtendAbstract = RequestExtendAbstract,
  Response extends ResponseExtendAbstract = ResponseExtendAbstract
> = (
  error?: Error | JRPCExceptionAbstract,
  req?: Request,
  res?: Response,
  next?: TypeNextFunction
) => void;

export type TypeRegisterFn<
  Request extends RequestExtendAbstract = RequestExtendAbstract,
  Response extends ResponseExtendAbstract = ResponseExtendAbstract
> = (req?: Request, res?: Response) => Promise<void>;
