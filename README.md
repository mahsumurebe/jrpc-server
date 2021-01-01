# jRPC Server

Typed JSONRPC 2.0 Server for Nodejs.

Fully tested to comply with the official [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)

![GitHub package.json version](https://img.shields.io/github/package-json/v/mahsumurebe/jrpc-server?style=for-the-badge)
![Libraries.io SourceRank, scoped npm package](https://img.shields.io/librariesio/sourcerank/npm/@mahsumurebe/jrpc-server?style=for-the-badge)
![minzipped-size](https://img.shields.io/bundlephobia/minzip/@mahsumurebe/jrpc-server/1.1.3?style=for-the-badge)
![minfied-size](https://img.shields.io/bundlephobia/min/@mahsumurebe/jrpc-server/1.1.3?style=for-the-badge)
![issues-open](https://img.shields.io/github/issues/mahsumurebe/jrpc-server?style=for-the-badge)
![issues-closed](https://img.shields.io/github/issues-closed/mahsumurebe/jrpc-server?style=for-the-badge)
![license](https://img.shields.io/github/license/mahsumurebe/jrpc-server?style=for-the-badge)

## Quick Overview

It is used to quickly create JSONRPC Server. Method definition is very simple. With the event structure, events can be easily followed.

## Install
```
npm install @mahsumurebe/jrpc-server
```

## Usage

It should not create a Server Class instance.

```typescript
const server = new RPCServer({
    hostname: '127.0.0.1',
    port: 3000
});
```

Method definitions are after Server Class instance is created.

```typescript
server.methods.add('help', () => {
    return 'DONE';
});

server.methods.add('sum', (a:number, b:number) => {
    return a + b;
});
```

After the methods are defined, the 'listen' method is triggered.
Listen returns the Promise object.
Promise output is the 'IListenResponse' interface.

```typescript
server.listen()
    .then(address=>console.log(`Listening on ${address.toString()}`));
```

# Testing

You can use the code below to send and test the cURL request.

```shell script
curl -H "Content-Type: application/json" -d "{\"id\":2,\"method\":\"sum\",\"params\":[1,2]}" http://127.0.0.1:3000
```
***Response:***
```json
{"id":2,"result":3}
```

