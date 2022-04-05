/* eslint class-methods-use-this: 0 */
const Writable = require('stream').Writable;

// setup dev null stream to fix the EPIPE error we were seeing in the client
class NullStream extends Writable {

    constructor(opts = {}) {
        super(opts);
        this.opts = opts;
    }

    _write(chunk, encoding, callback) {
        return callback();
    }
}

module.exports = NullStream;