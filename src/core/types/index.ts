import {
  JRPCErrorResponseBodyInterface,
  JRPCRequestBodyInterface,
  JRPCResponseBodyInterface,
} from "../interfaces";

export type TypeMethodParam = Array<any> | object;

export type TypeId = string | number | null;

export type TypeJRPCResponse =
  | JRPCResponseBodyInterface
  | JRPCErrorResponseBodyInterface;

export type TypePartialJRPCRequestBody =
  | Partial<JRPCRequestBodyInterface>
  | Partial<JRPCRequestBodyInterface>[];
