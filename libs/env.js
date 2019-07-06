/* eslint max-len: [2, 200] */

// simple method to get an environment property and return the value or a default value
// node treats all environment values as string this function would always return a string
// however sometimes it should return a number or boolean, so we call JSON.parse()
// unfortunately JSON.parse() can throw an exception
// for example if export LOG_LEVEL=debug then debug is passed to JSON.parse() instead of "debug"
// so then it blows up, however if 2e6 is passed to JSON.parse() it returns the correct 2000000
function getEnvVar( propName, defValue ) {
    var result = false;
    if ( process.env[ propName ] ) {
        result = process.env[ propName ];
    } else if ( defValue ) {
        result = defValue;
    }
    if ( typeof result === 'string' ) {
        try {
            result = JSON.parse( result );
        } catch ( e ) {
            // throw away
        }
    }
    return result;
}

module.exports = {
    getEnvVar
};
