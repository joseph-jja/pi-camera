from time import sleep
from picamera import PiCamera
from io import BytesIO

# memmory stream 
my_stream = BytesIO()

camera = PiCamera()
camera.resolution = (3280, 2464)
camera.start_preview()
sleep(2)

# continuous capture
camera.capture(my_stream, 'jpeg')
