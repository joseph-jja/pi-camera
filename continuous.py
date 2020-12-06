# taken from https://www.instructables.com/id/Raspberry-Pi-Astro-Cam/
from picamera import PiCamera 
from time import sleep,time 
from datetime import datetime
from fractions import Fraction 
from PIL import Image
from getopt import getopt
from os import mkdir,system
import sys

CAPTURE_DIR='/home/pi/captures'
EV_CAPTURE_DIR='/home/pi/captures/hdr_ev'

camera = PiCamera()    
camera.resolution = HIGH_RES
camera.still_stats = 'true'

daynow = datetime.now()
datestamp = str(daynow.year) + '-' + str(daynow.month) + '-' + str(daynow.day) + '-' + str(daynow.hour) + '-' + str(daynow.minute) + '-'
num = 0
default_framerate = camera.framerate

exposure_values = [-24, -18, -12, -6, 0, 1, 6, 12, 18, 24]

stellar_object_name='space'
argv = sys.argv[1:]
try:
   opts, args = getopt(argv,"s:")
except getopt.GetoptError:
    print ('continuous.py -s <stellar object name>')
    sys.exit(2)
for opt, arg in opts:
    print('opts ' + opt + ' ' + arg)
    if opt == '-s':
        stellar_object_name = arg

print ('stellar_object_name is set to ' + stellar_object_name)
CAPTURE_DIR='/home/pi/captures' + '/' + stellar_object_name
try:
    mkdir(CAPTURE_DIR)
except: 
    print('Could not make dir ' + CAPTURE_DIR);
    sleep(2)

EV_CAPTURE_DIR='/home/pi/captures' + '/' + stellar_object_name + '/hdr_ev'
try:
    mkdir(EV_CAPTURE_DIR)
except: 
    print('Could not make dir ' + EV_CAPTURE_DIR);
    sleep(2)

# menu to be printed on terminal
def print_menu():
    print("Options:")
    print("    p to start preview")
    print("    s to stop preview")
    print("    i to capture single image")
    print("    l to capture exposure -18 and -12 images 1/2 sec & zoom")
    print("    d to capture hrd-ish images")
    print("    c to capture 5 seconds continuous images")
    print("    e long video 5 minutes")
    print("    v medium video 1 minute")
    print("    t short video 30 seconds")
    print("    n for night mode")
    print("    r to change resolution")
    print("    zi to zoom in") 
    print("    zo to zoom out") 
    print("    q quit")

def change_resolution():
    print('\n' * 50)
    print("Resolution Options:")
    print("    a resolution 3280 x 2464")
    print("    b resolution 1640 x 1232")
    print("    c resolution 1920 x 1080")
    print("    d resolution 1280 x 720")
    print("    e resolution 640 x 480")
    reschoice = input('Enter a command: ')
    if reschoice == "a":
        camera.resolution = (3280,2464)
    elif reschoice == "b":
        camera.resolution = (1640,1232)
    elif reschoice == "c":
        camera.resolution = (1920, 1080)
    elif reschoice == "d":
        camera.resolution = (1280, 720)
    elif reschoice == "e":
        camera.resolution = (640, 480)
   
def capture_video(name, len):
    old_res = camera.resolution
    camera.resolution = (1920, 1080)
    camera.sensor_mode = 3
    camera.framerate = 30
    sleep(1)
    inum = datestamp + str(daynow.second) + '-' + str(num) 
    camera.start_preview()
    filename = CAPTURE_DIR + name + inum + '.h264'
    camera.start_recording(filename, format='h264', quality=15, resize=None, bitrate=20000000)
    camera.wait_recording(len)
    camera.stop_preview()    
    camera.stop_recording()
    camera.resolution = old_res
    system('MP4Box -add ' + filename + ' -tmp ' + CAPTURE_DIR + ' ' + filename + '.mp4')

def capture_hdr():
    camera.start_preview()
    sleep(2)
    image_list = []
    # 10 exposure compensation values at .25 seconds each
    # so 2.5 seconds HDR-ish image capture
    camera.exposure_mode = 'antishake'
    for ev in exposure_values:
        camera.exposure_compensation = ev
        inum = datestamp + str(daynow.second) + '-' + str(num) 
        camera.capture(EV_CAPTURE_DIR + '/Image_hdr_ev%s.jpg' % inum, quality=100)
        image_list.append(EV_CAPTURE_DIR + '/Image_hdr_ev%s.jpg' % inum)
        num = num + 1
        sleep(0.25)
    sleep(1)
    camera.exposure_compensation = 0
    camera.stop_preview()    
    print("Processing images ...")
    res = camera.resolution
    result = Image.new("RGB", res)
    for index, file in enumerate(image_list):
        img = Image.open(file)
        result.paste(img, (0, 0, res[0], res[1]))
    inum = datestamp + str(daynow.second) + '-' + str(num) 
    result.save(CAPTURE_DIR + '/Image_hdr%s.jpg' % inum)
    num = num + 1;
   
while True:
    num = num + 1
    print('\n' * 50)
    print_menu()
    choice = input('Enter a command: ')
    if choice == "p":
        # camera.start_preview(fullscreen=False,window=(300,0,0,200))
        camera.start_preview()
    elif choice == "s":
        camera.stop_preview()
    elif choice == "i":
        camera.start_preview()
        sleep(2)
        inum = datestamp + str(daynow.second) + '-' + str(num)
        camera.capture(CAPTURE_DIR + '/Image_img_%s.jpg' % inum, quality=100)
        sleep(1)
        camera.stop_preview()
    elif choice == "l":
        camera.start_preview()
        sleep(2)
        old_zoom = camera.zoom
        camera.zoom = (0.25, 0.25, 0.5, 0.5)
        camera.exposure_compensation = -18
        inum = datestamp + str(daynow.second) + '-' + str(num)
        camera.capture(CAPTURE_DIR + '/Image_ev18_%s.jpg' % inum, quality=100)
        sleep(0.5)
        camera.exposure_compensation = -12
        inum = datestamp + str(daynow.second) + '-' + str(num)
        camera.capture(CAPTURE_DIR + '/Image_ev12_%s.jpg' % inum, quality=100)
        sleep(0.5)
        camera.zoom = old_zoom
        camera.stop_preview()    
    elif choice == "d":
        capture_hdr()
    elif choice == "c":
        camera.start_preview()
        sleep(2)
        inum = datestamp + str(daynow.second) + '-' + str(num)
        camera.capture_continuous(CAPTURE_DIR + '/Image_cntns_{counter:03d}.jpg')
        sleep(5)
        # some fast zoomed image captures
        old_zoom = camera.zoom
        camera.zoom = (0.25, 0.25, 0.5, 0.5)
        for ev in range(-25,25):
            camera.exposure_compensation = ev
            inum = datestamp + str(daynow.second) + '-' + str(num) 
            camera.capture(EV_CAPTURE_DIR + '/Image_xhdr_ev%s.jpg' % inum, quality=100)
            sleep(0.025)
        camera.zoom = old_zoom
        camera.stop_preview()    
    elif choice == "t":
        capture_video('/short', 30)
    elif choice == "e":
        capture_video('/long', 60)
    elif choice == "v":
        capture_video('/medium', 60)
    elif choice == "n":
        # Set a framerate of 1/6fps, then set shutter
        # speed to 6s and ISO to 800
        # night mode
        #camera.framerate = Fraction(1, 6)
        camera.framerate = 1
        camera.sensor_mode = 3
        camera.shutter_speed = 6000000
        camera.iso = 800
        sleep(30)
        camera.exposure_mode = 'off'
        # Give the camera a good long time to measure AWB
        # (you may wish to use fixed AWB instead)
        sleep(5)
        camera.start_preview()
        sleep(5)
        camera.stop_preview()
    elif choice == "r":
        change_resolution()
    elif choice == "zi":
        camera.zoom = (0.25, 0.25, 0.5, 0.5)
    elif choice == "zo":
        camera.zoom = (0.0, 0.0, 1.0, 1.0)
    elif choice == "q":
        break
