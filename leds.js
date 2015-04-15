var led, 
  Gpio = require( 'onoff' ).Gpio,;


function Leds(enabled, ledPin) {
  
  if ( enabled ) {
    led = new Gpio( ledPin, 'out' );
  }
  
}

Leds.prototype.changeState = function(enabled, value) {
  
  if ( enabled ) {
        if ( value === 1 ) {
            led.write( 1, function ( err ) {
                console.log( "On " + err );
            } );
        } else {
            led.write( 0, function ( err ) {
                console.log( "Off " + err );
            } );
        }
    }
}

module.exports = Leds;
