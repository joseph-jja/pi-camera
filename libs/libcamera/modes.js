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
OR
0 : ov5647 [2592x1944] (/base/soc/i2c0mux/i2c@1/ov5647@36)
    Modes: 'SGBRG10_CSI2P' : 640x480 [58.92 fps - (16, 0)/2560x1920 crop]
                             1296x972 [43.25 fps - (0, 0)/2592x1944 crop]
                             1920x1080 [30.62 fps - (348, 434)/1928x1080 crop]
                             2592x1944 [15.63 fps - (0, 0)/2592x1944 crop]
*/

const CAMERA_ID_RE = /(ov\d*|imx\d*) (\[\d*x\d*\])/;

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
            } else if (cameraModes && cameraModes.length > 1 && imxCameraInfo[lastCameraId]) {
                if (!imxCameraInfo[lastCameraId].modes) {
                    imxCameraInfo[lastCameraId].modes = [];
                }
                const resolution = cameraModes[1],
                    binningResolution = cameraModes[3];
                const [x, y] = resolution.split('x'),
                    [bx, by] = binningResolution.split('x');
                const binned = `${bx/x}x${by/y}`;
                const mode = {
                    resolution: `--mode ${x}:${y}`,
                    resX: x,
                    resY: y,
                    fps: cameraModes[2],
                    binned: binned
                };
                const found = imxCameraInfo[lastCameraId].modes.find(m => {
                    if (m.resolution === mode.resolution &&
                        m.fps === mode.fps && m.binned === mode.binned) {
                        return true;
                    }
                    return false;
                });
                if (!found) {
                    imxCameraInfo[lastCameraId].modes.push(mode);
                }
            }

        });

        rl.on('close', () => {

            return resolve(imxCameraInfo);
        });
    });
}

module.exports = getModes;
