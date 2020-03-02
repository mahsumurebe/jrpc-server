import RPCServer from './index';

const port = 3000;

let server: RPCServer;

async function init() {
    console.log('starting server');
    server = new RPCServer({
        bind: '127.0.0.1',
        port,
    });

    server.on('listening', address => {
        console.log(`Listening on http://${address.bind}:${address.port}${address.path}`);
    });
    server.on('close', () => console.log('Server closed.'));
    server.on('error', (e) => console.error(`An error occurred.`, e));
    server.on('request', (method, params: Array<any>) => console.log(`REQUEST: ${method}(${(params || []).join(', ')})`));
    server.on('response', (data, method, params) => console.log(`RESPONSE: ${method}(${(params || []).join(', ')})\n${JSON.stringify(data)}`));
    await server.listen();
    console.log('add method');
    server.methods.add('help', () => {
        return {
            item: 'DONE',
        };
    });
}

init();