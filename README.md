# JSONRPC Server

JSONRPC 2.0 NodeJS Server written in TypeScript

Fully tested to comply with the official [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)

![GitHub package.json version](https://img.shields.io/github/package-json/v/mahsumurebe/jrpc-server?style=for-the-badge)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/mahsumurebe/jrpc-server?style=for-the-badge)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/mahsumurebe/jrpc-server?style=for-the-badge)
![npm](https://img.shields.io/npm/dt/@mahsumurebe/jrpc-server?style=for-the-badge)

![Libraries.io SourceRank, scoped npm package](https://img.shields.io/librariesio/sourcerank/npm/@mahsumurebe/jrpc-server?style=for-the-badge)
![minzipped-size](https://img.shields.io/bundlephobia/minzip/@mahsumurebe/jrpc-server/latest?style=for-the-badge)
![minfied-size](https://img.shields.io/bundlephobia/min/@mahsumurebe/jrpc-server/latest?style=for-the-badge)

![issues-open](https://img.shields.io/github/issues/mahsumurebe/jrpc-server?style=for-the-badge)
![issues-closed](https://img.shields.io/github/issues-closed/mahsumurebe/jrpc-server?style=for-the-badge)
![license](https://img.shields.io/github/license/mahsumurebe/jrpc-server?style=for-the-badge)

## Quick Overview

It is used to quickly create JSONRPC Server. Method definition is very simple. With the event structure, events can be
easily followed.

## Install

```
npm install @mahsumurebe/jrpc-server
```

## Usage

It should not create a JRPCServer instance.

```typescript
import {JRPCServer, HttpAdapter} from '@mahsumurebe/jrpc-server';

// Create JSONRPC Server with HTTP Adapter
const instance = await new JRPCServer(
    new HttpAdapter({
        hostname: "localhost",
        port: 3000,
    }),
    {
        paramType: 'array'
    }
);
// Start server
await instance.start();
```

### JRPCServer Options

| KEY            | DEFAULT   | DESCRIPTION                                                                                                                                      |
|----------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| paramType      | "array"   | Parameter type. Specifies the type of params item in the body of the JSONRPC request.                                                            |
| methodManager  | undefined | Manager that stores methods and calls them.                                                                                                      |
| routerManager  | undefined | The manager that processes the requests forwarded by the adapter, calls the relevant method(s) via the method manager and creates response data. |
| validator      | undefined | The method called to validate each JSONRPC request. Returns InvalidParamException if an invalid JSONRPC body was sent.                           |

### Method Definition

Method definitions are after JRPCServer instance is created.

```typescript
instance.methods.add('help', () => {
    return 'DONE';
});

instance.methods.add('sum', (a: number, b: number) => {
    return a + b;
});
```

## For Testing

You can use the code below to send and test the cURL request.

```shell script
curl -H "Content-Type: application/json" -d '{"id":2, "jsonrpc":"2.0","method":"sum","params":[1,2]}' http://127.0.0.1:3000
```

***Response:***

```json
{
  "id": 2,
  "jsonrpc": "2.0",
  "result": 3
}
```

## Adapters

There are HTTP and Websocket adapters available.

### HTTP

HTTP Adapter is used to create to JRPC Server served over HTTP Protocol.

```typescript
// Adapter Instance
import {JRPCServer, HttpAdapter} from '@mahsumurebe/jrpc-server';

const adapter = new HttpAdapter({
    port: 3000
})

// Create Instance
const instance = new JRPCServer(adapter);
```

#### Configuration List

Configurations are defined in the object in the first parameter of the construction method when creating the
HttpAdapter.

| KEY                   | DEFAULT   | DESCRIPTION                                                                                                        | Type    |
|-----------------------|-----------|--------------------------------------------------------------------------------------------------------------------|---------|
| hostname              | 127.0.0.1 | Server listening address                                                                                           | string  |
| port                  | undefined | Server listening port                                                                                              | number  |
| pathname              | "/"       | Server listening path                                                                                              | string  |
| keepAlive             | false     | Activates the keep-alive function on the socket immediately after a new incoming connection is received            | boolean |
| keepAliveInitialDelay | 0         | If set to a positive number, it sets the initial delay before the first keepalive probe is sent on an idle socket. | number  |
| ssl                   | undefined | SSL Config                                                                                                         | object  |
| ssl.cert              | undefined | Cert chains in PEM format                                                                                          | string  |
| ssl.privateKey        | undefined | Private keys in PEM format. PEM allows the option of private keys being encrypted.                                 | string  |

### Websocket

Websocket Adapter is used to create to JRPC Server served over Websocket Protocol.

```typescript
import {JRPCServer, WebsocketAdapter} from '@mahsumurebe/jrpc-server';

// Adapter Instance
const adapter = new WebsocketAdapter({port: 3000})

// Create Instance
const instance = new JRPCServer(adapter);
```

#### Configuration List

Configurations are defined in the object in the first parameter of the construction method when creating the
WebsocketAdapter.

#### Configuration List

Configurations are defined in the object in the first parameter of the construction method when creating the
HttpAdapter.

| KEY                   | DEFAULT   | DESCRIPTION                                                                                                        | Type    |
|-----------------------|-----------|--------------------------------------------------------------------------------------------------------------------|---------|
| hostname              | 127.0.0.1 | Server listening address                                                                                           | string  |
| port                  | undefined | Server listening port                                                                                              | number  |
| pathname              | "/"       | Server listening path                                                                                              | string  |
| keepAlive             | false     | Activates the keep-alive function on the socket immediately after a new incoming connection is received            | boolean |
| keepAliveInitialDelay | 0         | If set to a positive number, it sets the initial delay before the first keepalive probe is sent on an idle socket. | number  |
| ssl                   | undefined | SSL Config                                                                                                         | object  |
| ssl.cert              | undefined | Cert chains in PEM format                                                                                          | string  |
| ssl.privateKey        | undefined | Private keys in PEM format. PEM allows the option of private keys being encrypted.                                 | string  |

#### Custom Adapters

For custom adapters, you need to extend the adapter class with the `AdapterAbstract` abstract class.
You have to create the abstract functions request, connect and destroy inside the class.

**listen**: A piece of code should be added to this method that enables the creation of a protocol server.

**shutdown**: A piece of code should be added to this method that enables the protocol server shutdown.

**isListening**: Checks protocol server is listening.

### How to Use Both HTTP Adapter and Web Socket Adapter

If you want the server you created to respond to request both over the HTTP protocol
and over the Websocket protocol, it will be sufficient to place an HttpAdapter class
inside the WebsocketAdapter class constructor.

```typescript
import {HttpAdapter, WebsocketAdapter, JRPCServer} from '@mahsumurebe/jrpc-server';

// Create HTTP Adapter
const httpAdapter = new HttpAdapter({
    hostname: "localhost",
    port: 3000,
});
// Create Websocket Adapter with HTTP Adapter
const websocketAdapter = new WebsocketAdapter(httpAdapter);

// Create instance
const instance = new JRPCServer(websocketAdapter);
```

## Resources

- [Changelog](./CHANGELOG.md)
