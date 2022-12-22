# deps
# sudo apt install -y python3-libcamera python3-kms++
# sudo apt install -y python3-prctl libatlas-base-dev ffmpeg libopenjp2-7 python3-pip
# pip3 install numpy --upgrade
# opencv?
# sudo apt install -y python3-opencv
# sudo apt install -y opencv-data

# setup share memory space for images

# create threads
# - image capture thread
# - process and save images thread

import time

from picamera2 import Picamera2
from picamera2.encoders import ??

from picamera2 import Picamera2

picam2 = Picamera2()

#picam2.preview_configuration
config = picam2.video_configuration(main={"size": (1332, 990), "format": "YUV420"})

picam2.configure(config)
