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
camera.resolution = (3280,2464)
camera.still_stats = 'true'
camera.shutter_speed = 10000000

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
    print("    a to capture single image")
    print("    b to capture exposure -18 and -12 images 1/2 sec & zoom")
    print("    c to capture hrd-ish images")
    print("    d to capture continuous images")
    print("    e long video 5 minutes")
    print("    f medium video 1 minute")
    print("    g short video 30 seconds")
    print("    h framerate, iso, contrast, saturation, brightness and sharpness")
    print("    i to change resolution")
    print("    j to zoom in") 
    print("    k to zoom out") 
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
        camera.sensor_mode = 3
    elif reschoice == "b":
        camera.resolution = (1640,1232)
        camera.sensor_mode = 4
    elif reschoice == "c":
        camera.resolution = (1920, 1080)
        camera.sensor_mode = 1
    elif reschoice == "d":
        camera.resolution = (1280, 720)
        camera.sensor_mode = 6
    elif reschoice == "e":
        camera.resolution = (640, 480)
        camera.sensor_mode = 7
   
def change_iso():
    print('\n' * 50)
    print("Enter ISO Value:")
    print("100, 200, 400, 800, 1600, 3200 or 0 to reset: " + str(camera.exposure_speed) + ' ' + camera.exposure_mode)
    reschoice = input('Value: ')
    if not reschoice or reschoice == 0:
         camera.exposure_mode = 'auto'
    else:
         camera.iso = int(reschoice)
         sleep(5)
         camera.shutter_speed = camera.exposure_speed
         camera.exposure_mode = 'off'
         g = camera.awb_gains
         camera.awb_mode = 'off'
         camera.awb_gains = g

def change_framerate():
    print('\n' * 50)
    print("Enter framerate Value: " + str(camera.framerate))
    print("1 to 30")
    reschoice = input('Value: ')
    if reschoice:
        camera.framerate = int(reschoice)

def change_contrast():
    print('\n' * 50)
    print("Enter contrast Value: " + str(camera.contrast))
    print("-100 to 100")
    reschoice = input('Value: ')
    if reschoice and reschoice != 0:
        camera.contrast = int(reschoice)

def change_saturation():
    print('\n' * 50)
    print("Enter saturation Value: " + str(camera.saturation))
    print("-100 to 100")
    reschoice = input('Value: ')
    if reschoice and reschoice != 0:
        camera.saturation = int(reschoice)

def change_sharpness():
    print('\n' * 50)
    print("Enter sharpness Value: " + str(camera.sharpness))
    print("-100 to 100")
    reschoice = input('Value: ')
    if reschoice and reschoice != 0:
        camera.sharpness = int(reschoice)

def change_brightness():
    print('\n' * 50)
    print("Enter brightness Value: " + str(camera.brightness))
    print("0 to 100")
    reschoice = input('Value: ')
    if reschoice and reschoice != 0:
        camera.brightness = int(reschoice)

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

def capture_hdr(num):
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
    elif choice == "a":
        camera.start_preview()
        inum = datestamp + str(daynow.second) + '-' + str(num)
        camera.capture(CAPTURE_DIR + '/Image_img_%s.jpg' % inum, quality=100)
        sleep(1)
        camera.stop_preview()
    elif choice == "b":
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
        camera.exposure_compensation = 0
        camera.stop_preview()    
    elif choice == "c":
        capture_hdr(num)
    elif choice == "d":
        camera.start_preview()
        sleep(2)
        inum = datestamp + str(daynow.second) + '-' + str(num)
        camera.capture_continuous(CAPTURE_DIR + '/Image_cntns_{counter:03d}.jpg')
        sleep(5)
        # capture 100 images
        res = camera.resolution
        result = Image.new("RGB", res)
        for ev in range(0, 200):
            inum = datestamp + str(daynow.second) + '-' + str(num) 
            camera.capture(EV_CAPTURE_DIR + '/Image_cont_ev%s.jpg' % inum, quality=100)
            sleep(0.025)
            img = Image.open(EV_CAPTURE_DIR + '/Image_cont_ev%s.jpg' % inum, quality=100)
            result.paste(img, (0, 0, res[0], res[1]))
        result.save(CAPTURE_DIR + '/Image_combo_%s.jpg' % inum)
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
    elif choice == "e":
        capture_video('/short', 30)
    elif choice == "f":
        capture_video('/long', 60)
    elif choice == "g":
        capture_video('/medium', 60)
    elif choice == "h":
        # Set a framerate of 1/6fps, then set shutter
        # speed to 6s and ISO to 800
        # night mode
        #camera.framerate = Fraction(1, 6)
        change_framerate()
        change_iso()
        change_contrast()
        change_saturation()
        change_brightness()
        change_sharpness()
        camera.start_preview()
        sleep(5)
        camera.stop_preview()
    elif choice == "i":
        change_resolution()
    elif choice == "j":
        camera.zoom = (0.25, 0.25, 0.5, 0.5)
    elif choice == "k":
        camera.zoom = (0.0, 0.0, 1.0, 1.0)
    elif choice == "q":
        break
