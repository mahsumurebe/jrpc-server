/**
 * Exit handler
 * @param {function} handler
 *
 * @return {void}
 */
export function exitHandler(
  handler: (
    opt: { cleanup?: boolean; exit?: boolean },
    exitCode?: number | Error
  ) => Promise<void> | void
) {
  // process.stdin.resume(); // so the program will not close instantly

  // do something when app is closing
  process.on("exit", handler.bind(null, { cleanup: true }));

  // catches ctrl+c event
  process.on("SIGINT", handler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", handler.bind(null, { exit: true }));
  process.on("SIGUSR2", handler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on("uncaughtException", handler.bind(null, { exit: true }));
}
