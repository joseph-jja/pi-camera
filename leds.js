var led,
    baseDir = process.cwd(),
    logger = require( `${baseDir}/libs/logger` ),
    Gpio = require( 'onoff' ).Gpio;


function Leds( enabled, ledPin ) {

    this.enabled = enabled;
    if ( enabled ) {
        led = new Gpio( ledPin, 'out' );
    }

}

Leds.prototype.changeState = function ( value ) {

    if ( this.enabled ) {
        if ( value === 1 ) {
            led.write( 1, function ( err ) {
                logger.info( "On " + err );
            } );
        } else {
            led.write( 0, function ( err ) {
                logger.info( "Off " + err );
            } );
        }
    }
}

Leds.prototype.cleanup = function () {

    if ( this.enabled ) {
        led.writeSync( 0 );
        led.unexport();
    }
}

module.exports = Leds;
