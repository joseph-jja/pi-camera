# taken from https://www.instructables.com/id/Raspberry-Pi-Astro-Cam/
camera = PiCamera()    
num=0
while True:
    print('\n' * 50)
    print_menu()
    choice = input('Enter a command: ')
    if choice == "p":
        camera.start_preview()
    elif choice == "s":
        camera.stop_preview()
    elif choice == "1":
        camera.start_preview()
        sleep(1)
        camera.capture('/tmp/Image#%s.jpg' % num)
        num = num + 1;
        camera.stop_preview()
    elif choice == "5":
        camera.start_preview()
        sleep(1)
        for i in range(5):
            camera.capture('/tmp/Imageseries#%s.jpg' % num)
            num = num + 1
            sleep(1)
        camera.stop_preview()    
    elif choice == "h":
        camera.resolution = (3240,2464)
    elif choice == "m":
        camera.resolution = (1640,1232)
    elif choice == "l":
        camera.resolution = (800, 480)
    elif choice == "q":
        break
