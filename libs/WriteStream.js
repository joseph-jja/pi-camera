/* eslint class-methods-use-this: 0 */
const Writable = require('stream').Writable;

// setup dev null stream to fix the EPIPE error we were seeing in the client
class WriteStream extends Writable {

    constructor(opts = {}) {
        super(opts);
        this.opts = opts;
        this.maxSize = opts.maxSize || 2e6;
        this.size = 0;
        this.buffers = [];
        this.encoding = opts.encoding;
    }

    _write(chunk, encoding, callback) {
        this.size += chunk.length;
        if (this.size > this.maxSize) {
            throw `Max size: ${this.maxSize} exceeded`;
            return;
        }
        this.buffers.push(chunk);
        if (!this.encoding) {
            this.encoding = encoding || 'utf8';
        }
        return callback();
    }

    getBuffers() {
        return this.buffers();
    }
}

module.exports = WriteStream;
