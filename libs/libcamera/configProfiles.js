module.exports = [{
    name: 'Star Capture',
    fields: [{
        name: 'ISO_Gain',
        value: 40.0,
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'EV_compensation',
        value: 10.0,
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 4',
        forms: ['videoOptions']
    }, {
        name: 'shutter_speed',
        value: 250000,
        forms: ['videoOptions', 'imageOptions']
    }]
}];
