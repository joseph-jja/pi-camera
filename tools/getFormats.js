const readline = require('readline'),
    {
        createReadStream
    } = require('fs');

const fmts = createReadStream('/tmp/fmts.log');

const rl = readline.createInterface({
  input: fmts
});

const still = new Set(),
    video = new Set();

rl.on('line', line => {

    const iw = line.indexOf('width'),
        ih = line.indexOf('height');

    const width = line.substring(iw+6).split(' ')[0].trim().replace(/\,/g, '');
    const height = line.substring(ih+7).trim();

    if (!isNaN(width) && !isNaN(height)) {

        if (width >= 640 && height >= 480 ) {

            still.add(`--width ${width} --height ${height}`);
            if (width <=1920 && height <= 1080 ) {
                video.add(`--width ${width} --height ${height}`);
            }
        }
    }

});

const sortFn = (a, b) => {
    const wha = a.split(' ')[1],
        whb = b.split(' ')[3];

    const xa = wha[0] * wha[1],
        xb = whb[0] * whb[1];

    if (xa > xb) {
        return 1;
    } else if (xa > xb) {
        return -1;
    } else {
        return 0;
    }
};

rl.on('close', () => {
    const skeys = Array.from(still.keys()),
        vkeys = Array.from(video.keys());
    console.log('Done still! ', skeys.sort(sortFn) );
    console.log('Done video! ', vkeys.sort(sortFn) );
});
