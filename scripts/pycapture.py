# deps
# sudo apt install -y python3-libcamera python3-kms++
# sudo apt install -y python3-prctl libatlas-base-dev ffmpeg libopenjp2-7 python3-pip
# sudo apt install -y python3-picamera2
# pip3 install numpy --upgrade
# opencv?
# sudo apt install -y python3-opencv
# sudo apt install -y opencv-data

# setup share memory space for images

# create threads
# - image capture thread
# - process and save images thread

import io
import time

from picamera2 import Picamera2

picam2 = Picamera2()

#picam2.preview_configuration
picam2.still_configuration.size = (1920, 1080)
#picam2.still_configuration.shutter = 8000
#picam2.still_configuration.color_space = 'SBGGR10'
config = picam2.still_configuration

picam2.configure(config)

picam2.start()
time.sleep(0.1)

data = io.BytesIO()
picam2.capture_file(data, format='png')
print(data.getbuffer().nbytes)
