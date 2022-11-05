import { JRPCExceptionAbstract, JRPCRequestBodyInterface } from "../../../core";

export interface RouterManagerConfigInterface {
  validator?: (
    body: Partial<JRPCRequestBodyInterface>,
    options: RouterManagerConfigInterface
  ) => JRPCExceptionAbstract | true;
  paramType: "object" | "array";
}
