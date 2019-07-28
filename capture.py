import io
import random
import time
import picamera

def motion_detected():
    # Randomly return True (like a fake motion detection routine)
    return random.randint(0, 10) == 0

camera = picamera.PiCamera()
stream = picamera.PiCameraCircularIO(camera, seconds=5)
camera.start_recording(stream, format='h264')
try:
    while True:
        camera.wait_recording(1)
        if motion_detected():
            now = time.localtime()
            videoPathBase = "/tmp/video_" + str(now.tm_hour) + "_" + str(now.tm_min) + "_" + str(now.tm_sec)
            videoPath = videoPathBase + '.h264';
            # Keep recording for 10 seconds and only then write the
            # stream to disk
            camera.wait_recording(15)
            stream.copy_to(videoPath)
            print videoPath
finally:
    camera.stop_recording()
