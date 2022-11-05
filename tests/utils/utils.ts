import * as Client from "@mahsumurebe/jrpc-client";
import * as ClientCore from "@mahsumurebe/jrpc-client/lib/core";
import * as Server from "../../src";
import * as ServerCore from "../../src/core";

export async function generateJRPCClient<
  TParam extends ClientCore.TypeMethodParam = Array<any>
>(adapter: ClientCore.AdapterAbstract<TParam>): Promise<Client.JRPCClient> {
  const client = new Client.JRPCClient(adapter);
  await client.start();
  return client;
}

export async function generateJRPCServer(
  adapter: ServerCore.AdapterAbstract,
  paramType: "array" | "object" = "array"
) {
  const server = new Server.JRPCServer(adapter, {
    paramType,
  });

  server.methods.add("foo", (a, b, c) => {
    return { a, b, c };
  });
  server.methods.add("timeout", async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 10000);
    });
  });
  server.methods.add("foo-throw", () => {
    throw new Error("error detail");
  });

  return server.start().then(() => server);
}
