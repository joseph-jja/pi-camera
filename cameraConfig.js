module.exports = [{
    name: 'ISO_Gain',
    paramName: '--gain',
    range: [1, 40],
    step: 0.1,
    decimalPlaces: 1
},{
    name: 'videoSize',
    paramName: '',
    values:[
        '--width 640 --height 480', 
        '--width 1296 --height 730',
        '--width 1920 --height 1080'
    ]
},{
    name: 'EV_compensation',
    comment: 'higher is brighter',
    paramName: '--ev',
    range: [-10, 10],
    step: 0.1,
    decimalPlaces: 1
},{
    name: 'metering',
    paramName: '--metering',
    values: ['centre', 'spot', 'average'] // 'custom'
},{
    name: 'framerate',
    paramName: '--framerate',
    values: [10, 15, 30, 60]
},{
    name: 'exposure_profile',
    paramName: '--exposure',
    values: ['normal', 'sport', 'long']
},{
    name: 'contrast',
    paramName: '--contrast',
    range: [0, 1],
    step: 0.1,
    decimalPlaces: 1
},{
    name: 'saturation',
    paramName: '--saturation',
    range: [0, 1],
    step: 0.1,
    decimalPlaces: 1
},{
    name: 'sharpness',
    paramName: '--sharpness',
    range: [0, 1],
    step: 0.1,
    decimalPlaces: 1
}/*,{
    name: 'brightness',
    paramName: '--brightness',
    range: [-1, 1],
    step: 0.1,
    decimalPlaces: 1
}*/];
