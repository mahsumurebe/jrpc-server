/**
 * Timeout FN
 * @param {number} ms Milliseconds
 * @param {Promise} promise Promise
 * @param {Error} err Error Instance for throw
 *
 * @return {Promise} Return promise value or throw timeout exception
 */
export function timeout<T>(
  ms: number,
  promise: Promise<T>,
  err: Error
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(err);
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
}
