# libcamera-apps and libav
Newer versions of the raspberry pi libcamera-apps libcamera-vid have support for integrating with libav.  This allows for different file types not supported by libcamera-vid like avi, mjpegts, and any file formats supported by ffmpeg. It also allows for capturing higher framerates and better quality than just the supporter h264 and built in mjpeg formats

## Using libav
- Simple usage is --codec libav and then the file extension will determine the type
- You can also pass --libav-format and the format comes from ffmpeg -formats
- It helps to pass in --bitrate ${bitrate} --profile high to get good quality video 
== see libs/utils.js getH264Bitrate() function for how based on resolution bitrate is caclulated here
== higher resolution needs higher bitrate
- currently libav supported formats codede here are 
== avi, h264, mjpegts, yuv420, mjpeg

