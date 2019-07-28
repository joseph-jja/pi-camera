import io
import RPi.GPIO as GPIO
import time
import picamera

def motion_detected():
    # Randomly return True (like a fake motion detection routine)
    GPIO.input(11)
if i==0:
    return random.randint(0, 10) == 0

# camera setup
camera = picamera.PiCamera()
stream = picamera.PiCameraCircularIO(camera, seconds=5)
camera.start_recording(stream, format='h264')

# PIR setup
pinIn= 11     # TODO change pint to argument
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(pinIn, GPIO.IN)    

try:
    while True:
        camera.wait_recording(1)
        motion = GPIO.input(pinIn)
        if motion == 1:
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
