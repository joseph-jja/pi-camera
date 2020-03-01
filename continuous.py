# taken from https://www.instructables.com/id/Raspberry-Pi-Astro-Cam/
from picamera import PiCamera 
from time import sleep 
from fractions import Fraction 
from PIL import Image
from os import remove

LOW_RES = (640, 480)
MEDIUM_RES = (1640,1232)
HIGH_RES = (3280,2464)

camera = PiCamera()    
camera.resolution = HIGH_RES

num=0
hdr_num = 0
default_framerate = camera.framerate

exposure_values = [-24, -18, -12, -6, 0, 1, 6, 12, 18, 24]

# menu to be printed on terminal
def print_menu():
    print("Options:")
    print("    p to start preview")
    print("    s to stop preview")
    print("    c to capture single image")
    print("    d to capture hrd-ish images")
    print("    n for night mode")
    print("    r to reset to normal mode")
    print("    h for high res image")
    print("    m for medium res image")
    print("    l for low res image")
    print("    q quit")

while True:
    print('\n' * 50)
    print_menu()
    choice = input('Enter a command: ')
    if choice == "p":
        camera.start_preview()
    elif choice == "s":
        camera.stop_preview()
    elif choice == "c":
        camera.start_preview()
        sleep(2)
        camera.capture('/tmp/Image%s.png' % num)
        num = num + 1;
        sleep(1)
        camera.stop_preview()
    elif choice == "d":
        camera.start_preview()
        sleep(2)
        image_list = []
        camera.exposure_mode = 'antishake'
        for ev in exposure_values:
            camera.exposure_compensation = ev
            camera.capture('/tmp/Image_ev%s.jpg' % hdr_num)
            image_list.append('/tmp/Image_ev%s.jpg' % hdr_num)
            sleep(0.1)
            hdr_num = hdr_num + 1
        #camera.capture_continuous('/tmp/Image{counter:03d}.jpg')
        sleep(1)
        camera.exposure_compensation = 0
        camera.stop_preview()    
        print("Processing images ...")
        res = camera.resolution
        result = Image.new("RGB", res)
        for index, file in enumerate(image_list):
            img = Image.open(file)
            result.paste(img, (0, 0, res[0], res[1]))
        result.save('/tmp/Image_hdr%s.jpg' % num)
        num = num + 1;
        for index, file in enumerate(image_list):
            remove(file)
    elif choice == "n":
        #camera.start_preview()
        # Set a framerate of 1/6fps, then set shutter
        # speed to 6s and ISO to 800
        # night mode
        camera.framerate = Fraction(1, 6)
        camera.shutter_speed = 6000000
        camera.exposure_mode = 'off'
        camera.iso = 800
        # Give the camera a good long time to measure AWB
        # (you may wish to use fixed AWB instead)
        sleep(10)
        #camera.stop_preview()
    elif choice == "r":
        # regular mode
        camera.framerate = default_framerate
        camera.shutter_speed
        camera.exposure_mode = 'auto'
        camera.iso = 0
        sleep(10)
    elif choice == "h":
        camera.resolution = HIGH_RES
    elif choice == "m":
        camera.resolution = MEDIUM_RES
    elif choice == "l":
        camera.resolution = LOW_RES
    elif choice == "q":
        break

