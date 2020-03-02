export type TMethodCallback = (...args: any) => any
export type TMethods = { [methodName: string]: TMethodCallback }