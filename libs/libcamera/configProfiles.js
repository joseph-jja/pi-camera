module.exports = [{
    name: 'Star Capture',
    fields: [{
        name: 'ISO_Gain',
        value: '--gain 40.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'EV_compensation',
        value: '--ev 10.0',
        forms: ['videoOptions', 'imageOptions']
    }, {
        name: 'framerate',
        value: '--framerate 4',
        forms: ['videoOptions']
    }, {
        name: 'shutter_speed',
        value: '--shutter 250000',
        forms: ['videoOptions', 'imageOptions']
    }]
}];
