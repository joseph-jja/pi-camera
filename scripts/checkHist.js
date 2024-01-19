const fs = require('fs').promises;

function findMax(histoIn) {

    let maxIndex = 0,
        maxValue = 0;
    histoIn.forEach(item => {
        const [ index, value ] = item.split(' ');
        if (value > maxValue) {
            maxIndex = index;
            maxValue = value;
        }
     });
     return {
        maxIndex,
        maxValue
     };
}

async function run() {

    const red = await fs.readFile('histo_red.dat');
    const green = await fs.readFile('histo_green.dat');
    const blue = await fs.readFile('histo_blue.dat');

    const redHisto = red.toString().split(/\n/);
    const greenHisto = green.toString().split(/\n/);
    const blueHisto = blue.toString().split(/\n/);

    const redMax = redHisto.length;
    const greenMax = greenHisto.length;
    const blueMax = blueHisto.length;

    const redLow = Math.round(redMax * 0.2),
        redHigh = Math.round(redMax * 0.3);
    const greenLow = Math.round(greenMax * 0.2),
        greenHigh = Math.round(greenMax * 0.3);
    const blueLow = Math.round(blueMax * 0.2),
        blueHigh = Math.round(blueMax * 0.3);

    const redMaxes = findMax(redHisto);
    const greenMaxes = findMax(greenHisto);
    const blueMaxes = findMax(blueHisto);

    if (redMaxes.maxIndex >= redLow && redMaxes.maxIndex <= redHigh) {
        console.log('Red channel good', Math.round(redMaxes.maxIndex / redLow));
        if (redMaxes.maxIndex >= Math.floor(redMax * 0.24) && redMaxes.maxIndex <= Math.floor(redMax * 0.26) ) {
            console.log('Red channel is great');
        }
    } else {
        console.log('Red channel bad');
    }
    if (greenMaxes.maxIndex >= greenLow && greenMaxes.maxIndex <= greenHigh) {
        console.log('Green channel good', Math.round(greenMaxes.maxIndex / greenMax));
        if (greenMaxes.maxIndex >= Math.floor(greenMax * 0.24) && greenMaxes.maxIndex <= Math.floor(greenMax * 0.26) ) {
            console.log('Green channel is great');
        }
    } else {
        console.log('Green channel bad');
    }
    if (blueMaxes.maxIndex >= blueLow && blueMaxes.maxIndex <= blueHigh) {
        console.log('Blue channel good', Math.round(blueMaxes.maxIndex / blueMax));
        if (blueMaxes.maxIndex >= Math.floor(blueMax * 0.24) && blueMaxes.maxIndex <= Math.floor(blueMax * 0.26) ) {
            console.log('Blue channel is great');
        }
    } else {
        console.log('Blue channel bad');
    }
    console.log(redMaxes, greenMaxes, blueMaxes)

}
run();
