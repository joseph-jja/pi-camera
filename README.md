# pi-camera
This is a simple code couple of scripts for making a motion detection camera capture system using the raspberry pi, a pir sensor and a camera.

## to install
- install nodejs and forever
  - node 0.12.x is what is being used right now
- install ffmpeg for avconv
- clone this repo 
- create a config.json for the mail 
- if you are like me, you'll want a read only filesystem to save your sd card in case of power outage or just to reduce wear, so execute the following commands
  - sudo apt-get install unionfs-fuse
  - cd /home/pi/pi-camera
  - sudo cp ro_mount/cmdline.txt /boot
  - sudo mkdir /orig
  - sudo cp ro_mount/fstab /etc
  - sudo cp ro_mount/rc.local /etc
  - sudo cp -r /etc /orig/
  - sudo cp -r /var /orig/
  - sudo cp ro_mount/mount_unionfs /usr/local/bin
- rc.local has use this command to flush buffers - I put this in rc.local
  - echo 3 > /proc/sys/vm/drop_caches
- disable the swap partitiion because you don't want all those writes to disk
  - sudo swapoff -a
  - sudo update-rc.d -f dphys-swapfile remove
  - sudo rm /var/swap

## NOTE: This code was originally taken from pi_videoEMailIntruder.  The email code was cleaned up and made into a module.  

## To swich from read only to read and write you may need to use fuser
### sudo fuser -c /etc
### then sudo kill -9 <pids>

# you will need to generate ssl keys to do ssl
- openssl req -newkey rsa:2048 -nodes -keyout domain.key -out domain.csr
== pass in you info for -subj "/C=US/ST=New York/L=Brooklyn/O=Example Brooklyn Company/CN=examplebrooklyn.com"

