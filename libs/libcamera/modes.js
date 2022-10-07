const readline = require('readline'),
    {
        createReadStream
    } = require('fs');

// example modes 
/* 
Available cameras
-----------------
0 : imx219 [3280x2464] (/base/soc/i2c0mux/i2c@1/imx219@10)
    Modes: 'SRGGB10_CSI2P' : 640x480 [206.65 fps - (1000, 752)/1280x960 crop]
                             1640x1232 [41.85 fps - (0, 0)/3280x2464 crop]
                             1920x1080 [47.57 fps - (680, 692)/1920x1080 crop]
                             3280x2464 [21.19 fps - (0, 0)/3280x2464 crop]
           'SRGGB8' : 640x480 [206.65 fps - (1000, 752)/1280x960 crop]
                      1640x1232 [41.85 fps - (0, 0)/3280x2464 crop]
                      1920x1080 [47.57 fps - (680, 692)/1920x1080 crop]
                      3280x2464 [21.19 fps - (0, 0)/3280x2464 crop]
*/

const CAMERA_ID_RE = /(imx\d*) (\[\d*x\d*\])/;

const CAMERA_MODES = /(\d*x\d*) \[(\d*\.\d*) fps - \(\d*, \d*\)\/(\d*x\d*) crop\]/;

async function getModes(configFile) {

    return new Promise(resolve => {

        const modes = createReadStream('/tmp/cameraInfo.txt');

        let imxCameraInfo = {},
            lastCameraId;

        const rl = readline.createInterface({
            input: modes
        });
        
        rl.on('line', line => {
            
            const cameraId = line.match(CAMERA_ID_RE), 
                cameraModes = line.match(CAMERA_MODES);

            if (cameraId && cameraId.length > 1) {
                lastCameraId = cameraId[1];
                if (!imxCameraInfo[lastCameraId]) {
                    imxCameraInfo[lastCameraId] = {};
                    imxCameraInfo[lastCameraId].count = 0;
                    imxCameraInfo[lastCameraId].maxResolution = cameraId[2].replace('[', '').replace(']', '');
                }
                imxCameraInfo[lastCameraId].count++;
            } else if (cameraModes && cameraModes.length > 1) {
                if (!imxCameraInfo[lastCameraId].modes) {
                    imxCameraInfo[lastCameraId].modes = [];
                }
                const resolution = cameraModes[1],
                    binningResolution = cameraModes[3];
                const [x, y] = resolution.split('x'),
                    [bx, by] = binningResolution.split('x');
                const binned = `${x/bx}x${y/by}`;
                const mode = {
                    resolution: resolution,
                    fps: cameraModes[2],
                    binned: binned
                };
                imxCameraInfo[lastCameraId].modes.push(mode);
            }

        });
        
        rl.on('close', () => {

            return resolve(imxCameraInfo);
        });
    });
}

module.exports = getModes;
