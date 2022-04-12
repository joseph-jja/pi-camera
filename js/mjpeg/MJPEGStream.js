export default class MJPEGStream {

    constructor(args) {

        const autoStart = args.autoStart || false;

        this.url = args.url;
        this.refreshRate = args.refreshRate || 500;
        this.onStart = args.onStart || null;
        this.onFrame = args.onFrame || null;
        if (!args.onFrameCaller) {
            throw Error('onFrameCaller option is REQUIRED!');
        }
        this.onFrameCaller = args.onFrameCaller;
        this.onStop = args.onStop || null;
        this.callbacks = {};
        this.running = false;
        this.frameTimer = 0;

        this.img = new Image();
        if (autoStart) {
            this.img.onload = this.start;
        }
        this.img.src = this.url;
    }

    setRunning(running) {
        this.running = running;
        const self = this;
        if (this.running) {
            this.img.src = this.url;
            this.frameTimer = setInterval(function() {
                if (self.onFrame) {
                    self.onFrame.call(self.onFrameCaller, self.img);
                }
            }, this.refreshRate);
            if (this.onStart) {
                this.onStart();
            }
        } else {
            this.img.src = '#';
            clearInterval(this.frameTimer);
            if (this.onStop) {
                this.onStop();
            }
        }
    }

    start() {
        this.setRunning(true);
    }

    stop() {
        this.setRunning(false);
    }
}
