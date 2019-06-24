from time import sleep
from picamera import PiCamera

camera = PiCamera()
camera.resolution = (3280, 2464)

while True
    sleep(.1)
    camera.capture('/tmp/space.jpg')
