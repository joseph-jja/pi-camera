var gpio = require('rpi-gpio');

gpioPin = 16;

gpio.setMode(gpio.MODE_RPI);
gpio.setPollFrequency(100);
gpio.setup(gpioPin, gpio.DIR_IN, readInput);

function readInput() {
    gpio.read(gpioPin, function(err, value) {
        console.log('The value is ' + value);
    });
}
