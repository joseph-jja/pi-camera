# taken from https://www.instructables.com/id/Raspberry-Pi-Astro-Cam/
from picamera import PiCamera 
from time import sleep 
from fractions import Fraction 
from PIL import Image

CAPTURE_DIR='/home/pi/captures'

HD_RES = (1920, 1080)
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
    print("    i to capture single image")
    print("    l to capture exposure -18 and -12 images 1/2 sec & zoom")
    print("    d to capture hrd-ish images")
    print("    c to capture 5 seconds continuous images")
    print("    t long video 30 minutes")
    print("    e long video 5 minutes")
    print("    v short video 1 minute")
    print("    n for night mode")
    print("    r to reset to normal mode")
    print("    h for high res image")
    print("    m for medium res image")
    print("    z to zoom") 
    print("    q quit")

while True:
    print('\n' * 50)
    print_menu()
    choice = input('Enter a command: ')
    if choice == "p":
        camera.start_preview()
    elif choice == "s":
        camera.stop_preview()
    elif choice == "i":
        camera.start_preview()
        sleep(2)
        camera.capture(CAPTURE_DIR + '/Image%s.jpg' % num, quality=100)
        num = num + 1;
        sleep(1)
        camera.stop_preview()
    elif choice == "l":
        camera.start_preview()
        sleep(2)
        camera.zoom = (0.25, 0.25, 0.5, 0.5)
        camera.exposure_compensation = -18
        camera.capture_continuous(CAPTURE_DIR + '/Image_ev18_{counter:03d}.jpg')
        sleep(0.5)
        camera.exposure_compensation = -12
        camera.capture_continuous(CAPTURE_DIR + '/Image_ev12_{counter:03d}.jpg')
        sleep(0.5)
        camera.zoom = (0.0, 0.0, 1.0, 1.0)
        camera.stop_preview()    
    elif choice == "d":
        camera.start_preview()
        sleep(2)
        image_list = []
        # 10 exposure compensation values at .25 seconds each
        # so 2.5 seconds HDR-ish image capture
        camera.exposure_mode = 'antishake'
        for ev in exposure_values:
            camera.exposure_compensation = ev
            camera.capture(CAPTURE_DIR + '/Image_ev%s.jpg' % hdr_num, quality=100)
            image_list.append(CAPTURE_DIR + '/Image_ev%s.jpg' % hdr_num)
            sleep(0.25)
            hdr_num = hdr_num + 1
        sleep(1)
        camera.exposure_compensation = 0
        camera.stop_preview()    
        print("Processing images ...")
        res = camera.resolution
        result = Image.new("RGB", res)
        for index, file in enumerate(image_list):
            img = Image.open(file)
            result.paste(img, (0, 0, res[0], res[1]))
        result.save(CAPTURE_DIR + '/Image_hdr%s.jpg' % num)
        num = num + 1;
        for index, file in enumerate(image_list):
            try:
                remove(file)
            finally:
                print("Could not remove file: " + file)
                sleep(1)
    elif choice == "c":
        camera.start_preview()
        sleep(2)
        camera.capture_continuous(CAPTURE_DIR + '/Image{counter:03d}.jpg')
        sleep(5)
        camera.stop_preview()    
    elif choice == "t":
        old_res = camera.resolution
        camera.resolution = HD_RES
        camera.start_recording(CAPTURE_DIR + '/longest.mpeg', format='mjpeg', resize=None)
        camera.wait_recording(1800)
        camera.stop_recording()
        camera.resolution = old_res
    elif choice == "e":
        old_res = camera.resolution
        camera.resolution = HD_RES
        camera.start_recording(CAPTURE_DIR + '/long_video.mpeg', format='mjpeg', resize=None)
        camera.wait_recording(300)
        camera.stop_recording()
        camera.resolution = old_res
    elif choice == "v":
        old_res = camera.resolution
        camera.resolution = HD_RES
        camera.start_recording(CAPTURE_DIR + '/short_video.mpeg', format='mjpeg', resize=None)
        camera.wait_recording(60)
        camera.stop_recording()
        camera.resolution = old_res
    elif choice == "n":
        #camera.start_preview()
        # Set a framerate of 1/6fps, then set shutter
        # speed to 6s and ISO to 800
        # night mode
        camera.framerate = Fraction(1, 6)
        camera.shutter_speed = 6000000
        camera.exposure_mode = 'night'
        # Give the camera a good long time to measure AWB
        # (you may wish to use fixed AWB instead)
        sleep(5)
        #camera.stop_preview()
    elif choice == "z":
        camera.zoom = (0.25, 0.25, 0.5, 0.5)
    elif choice == "r":
        # regular mode
        camera.framerate = default_framerate
        camera.shutter_speed
        camera.exposure_mode = 'auto'
        camera.iso = 0
        camera.zoom = (0.0, 0.0, 1.0, 1.0)
        sleep(5)
    elif choice == "h":
        camera.resolution = HIGH_RES
    elif choice == "m":
        camera.resolution = MEDIUM_RES
    elif choice == "q":
        break

