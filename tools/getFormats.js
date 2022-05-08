const readline = require('readline'),
    {
        createReadStream
    } = require('fs');

const fmts = createReadStream('/tmp/fmts.log');

const rl = readline.createInterface({
  input: fmts
});

const matrix = new Map();

rl.on('line', line => {

    const iw = line.indexOf('width'),
        ih = line.indexOf('height');

    const width = line.substring(iw+6).split(' ')[0].trim().replace(/\,/g, '');
    const height = line.substring(ih+7).trim();

    if (!isNaN(width) && !isNaN(height)) {

        if (width >= 640 && height >= 480 ) {
            /*if (matrix.get(width)) {
                const h = matrix.get(width).split('x')[1];
                if (height > h) {
                    matrix.set(width, `${width}x${height}`);
                } else {
                    matrix.set(width, `${width}x${h}`);
                }
            } else {
                matrix.set(width, `${width}x${height}`);
            }*/
            matrix.set(`${width}x${height}`, `${width}x${height}`);
            //console.log(width, height);
        } 

    }

});

const sortFn = (a, b) => {
    const wha = a.split('x'),
        whb = b.split('x');

    const xa = wha[0] * wha[1], 
       xb = whb[0] * whb[1]; 

    if (xa > xb) {
        return 1;
    } else if (xa > xb) {
        return -1;
    } else {
        return 0;
    }
}

rl.on('close', () => {
    const keys = Array.from(matrix.values()); 
    console.log('Done! ', keys.sort(sortFn) );
});

