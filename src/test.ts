import RPCServer from './index';

const port = 3000;

let server: RPCServer;

async function init() {
    console.log('starting server');
    const basicAuth = require('express-basic-auth');
    server = new RPCServer({
        hostname: '127.0.0.1',
        port,
        middleware: [
            basicAuth({
                users: {
                    admin: 'password',
                },
            }),
        ],
    });

    server.on('listening', address => {
        console.log(`Listening on ${address.toString()}`);
    });
    server.on('close', () => console.log('Server closed.'));
    server.on('error', (e) => console.error(`An error occurred.`, e));
    server.on('request', (method, params: Array<any>) => console.log(`REQUEST:`, method, params));
    server.on('response', (data, method, params) => console.log(`RESPONSE:`, data, method, params));
    await server.listen();
    console.log('add method');
    server.methods.add('help', () => {
        return {
            item: 'DONE',
        };
    });
    server.methods.add('sum', (a: number, b: number) => {
        return a + b;
    });
}

init();