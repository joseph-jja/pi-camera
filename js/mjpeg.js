class MJPEGStream {

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

// class Player { ...
class MJPEGPlayer {

    defaultErrorHandler(e) {
        throw e;
    }

    constructor(canvas, url, options = {}) {

        if (typeof canvas === 'string' || canvas instanceof String) {
            this.canvas = document.getElementById(canvas);
        }
        this.context = this.canvas.getContext('2d');

        this.options = Object.assign({}, options);

        this.options.width = options.width || this.canvas.width;
        this.options.height = options.height || this.canvas.height;

        this.options.errorHandler = options.errorHandler || this.defaultErrorHandler;

        this.options.url = url;
        this.options.onFrame = this.updateFrame;
        this.options.onFrameCaller = this;

        this.options.onStart = () => {
            console.log('started');
        };

        this.options.onStop = () => {
            console.log('stopped');
        };

        this.stream = new MJPEGStream(this.options);

        const self = this;
        this.canvas.addEventListener('click', function() {
            if (self.stream.running) {
                self.stop();
            } else {
                self.start();
            }
        }, false);
    }

    scaleRect(srcSize, dstSize) {
        var ratio = Math.min(dstSize.width / srcSize.width,
            dstSize.height / srcSize.height);
        var newRect = {
            x: 0,
            y: 0,
            width: srcSize.width * ratio,
            height: srcSize.height * ratio
        };
        newRect.x = (dstSize.width / 2) - (newRect.width / 2);
        newRect.y = (dstSize.height / 2) - (newRect.height / 2);
        return newRect;
    }

    updateFrame(img) {
        var srcRect = {
            x: 0,
            y: 0,
            width: img.naturalWidth,
            height: img.naturalHeight
        };
        var dstRect = this.scaleRect(srcRect, {
            width: this.canvas.width,
            height: this.canvas.height
        });
        try {
            this.context.drawImage(img,
                srcRect.x,
                srcRect.y,
                srcRect.width,
                srcRect.height,
                dstRect.x,
                dstRect.y,
                dstRect.width,
                dstRect.height
            );
            console.log('.');
        } catch (e) {
            // if we can't draw, don't bother updating anymore
            this.stop();
            console.log('stopped! ', e);
            this.options.errorHandler(e);
        }
    };

    start() {
        this.stream.start();
    };

    stop() {
        this.stream.stop();
    };
}
