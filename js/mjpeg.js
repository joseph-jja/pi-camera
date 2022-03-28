// namespace MJPEG { ...
const MJPEG = {};

class MJPEGStream {

    constructor(args) {

        const autoStart = args.autoStart || false;

        this.url = args.url;
        this.refreshRate = args.refreshRate || 500;
        this.onStart = args.onStart || null;
        this.onFrame = args.onFrame || null;
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
                    self.onFrame(self.img);
                }
            }, this.refreshRate);
            if (this.onStart) {
                this.onStart();
            }
        } else {
            this.img.src = "#";
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
MJPEG.Player = function(canvas, url, options) {

    if (typeof canvas === "string" || canvas instanceof String) {
        canvas = document.getElementById(canvas);
    }
    const context = canvas.getContext("2d");

    const scaleRect = (srcSize, dstSize) => {
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
    };

    const updateFrame = (img) => {
        var srcRect = {
            x: 0,
            y: 0,
            width: img.naturalWidth,
            height: img.naturalHeight
        };
        var dstRect = scaleRect(srcRect, {
            width: canvas.width,
            height: canvas.height
        });
        try {
            context.drawImage(img,
                srcRect.x,
                srcRect.y,
                srcRect.width,
                srcRect.height,
                dstRect.x,
                dstRect.y,
                dstRect.width,
                dstRect.height
            );
            console.log(".");
        } catch (e) {
            // if we can't draw, don't bother updating anymore
            this.stop();
            console.log("!");
            throw e;
        }
    };

    if (!options) {
        options = {};
    }
    options.url = url;
    options.onFrame = updateFrame;

    options.onStart = function() {
        console.log("started");
    };

    options.onStop = function() {
        console.log("stopped");
    };

    var self = this;
    self.stream = new MJPEGStream(options);

    canvas.addEventListener("click", function() {
        if (self.stream.running) {
            self.stop();
        } else {
            self.start();
        }
    }, false);

    this.start = function() {
        this.stream.start();
    };

    this.stop = function() {
        this.stream.stop();
    };
};
