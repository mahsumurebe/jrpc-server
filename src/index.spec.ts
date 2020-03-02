import RPCServer from './index';
import Methods from './Core/Methods';

const port = 3000;
let server: RPCServer;

describe('Testing server', () => {
    beforeAll(() => {
        server = new RPCServer({
            bind: '127.0.0.1',
            port,
        });
    });

    it('should return RPCServer instance', () => {
        expect(server).toBeInstanceOf(RPCServer);
    });

    it('should RPCServer.method property have Methods interface', () => {
        expect(server.methods).toBeInstanceOf(Methods);
    });

    it(`should server listen ${port} port.`, () => {
        expect(server.listen()).resolves.toEqual(expect.objectContaining({port}));
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