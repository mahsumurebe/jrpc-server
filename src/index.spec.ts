import RPCServer from './index';
import JSONRPC from './Adapters/jsonrpc';
import Methods from './Core/Methods';

const port = 3000;
let parser: JSONRPC;
let server: RPCServer<JSONRPC>;

describe('Testing server', () => {
    beforeAll(() => {
        parser = new JSONRPC();
        server = new RPCServer({
            bind: '127.0.0.1',
            port,
        }, parser);
    });

    it('should return RPCServer instance', () => {
        expect(server).toBeInstanceOf(RPCServer);
    });

    it('should RPCServer.adapter property have JSONRPC interface', () => {
        expect(server.adapter).toBeInstanceOf(JSONRPC);
    });

    it('should RPCServer.method property have Methods interface', () => {
        expect(server.methods).toBeInstanceOf(Methods);
    });

    it(`should server listen ${port} port.`, async (done) => {
        try {
            const addressInfo = await server.listen();
            expect(addressInfo.port).toEqual(port);
            done();
        } catch (e) {
            done(e);
        }
    });

    it('method should be added', () => {
        server.methods.add('help', () => {
            return 'DONE';
        });
        expect(server.methods.names()).toEqual(expect.arrayContaining(['help']));
    });

    it('added method must be able to call', async (done) => {
        try {
            const out = await server.methods.call<string>('help');
            expect(out).toEqual('DONE');
            done();
        } catch (e) {
            done(e);
        }
    });
});