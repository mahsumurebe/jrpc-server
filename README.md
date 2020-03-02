# jRPC Server

Typed JSONRPC 2.0 Server for Nodejs.

Fully tested to comply with the official [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification)

## Quick Overview

It is used to quickly create JSONRPC Server. Method definition is very simple. With the event structure, events can be easily followed.

## Install
```
npm install jrpc-server
```

## Usage

Bir server yansıması oluşturulmalı.

```typescript
const server = new RPCServer({
    hostname: '127.0.0.1',
    port: 3000
});
```

Server yansıması oluşturulduktan sonra metod tanımlamaları yapılır. 

```typescript
server.methods.add('help', () => {
    return 'DONE';
});

server.methods.add('sum', (a:number, b:number) => {
    return a + b;
});
```

Metodlar tanımlandıktan sonra `listen` metodu tetiklenir. 
Listen Promise nesnesi döndürür. 
Promise çıktısı `IListenResponse` arayüzüdür.

```typescript
server.listen()
    .then(address=>console.log(`Listening on ${address.toString()}`));
```

# Testing

cURL isteği gönderip test etmek için aşağıdaki kodu kullanabilirsiniz.

```shell script
curl -H "Content-Type: application/json" -d "{\"id\":2,\"method\":\"sum\",\"params\":[1,2]}" http://127.0.0.1:3000
```
***Response:***
```json
{"id":2,"result":3}
```

