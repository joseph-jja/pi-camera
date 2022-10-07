// simple wrapper mainly for async / await but can be used for regular promises
const PromiseWrapper = promiseIn => promiseIn.then(data => [undefined, data]).catch(msg => [msg, undefined]);

module.exports = PromiseWrapper;
