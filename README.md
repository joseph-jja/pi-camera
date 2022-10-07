# pi-camera
This is some simple code and some of scripts for making a motion detection camera capture system using the raspberry pi, a pir sensor and a camera.

## to install
- install nodejs and forever or pm2
  - currently known to work with node 8.11.1 or later
- install ffmpeg for avconv
- clone this repo 
- create a config.json for the mail (see the other readme for config.json)
- if you are like me, you'll want a read only filesystem to save your sd card in case of power outage or just to reduce wear, so clone my pi-ro-mount repo and that should help. You'll need unionfs-fuse

## NOTE: This code was originally taken from pi_videoEMailIntruder.  The email code was cleaned up and made into a module.  

## To switch from read only to read and write you may need to use fuser
### sudo fuser -c /etc
### then sudo kill -9 <pids>
### I have also found some services (like avahi-daemon) need to be stopped so service --status-all will show whats running

# you will need to generate ssl keys to do ssl
- openssl req -newkey rsa:2048 -nodes -keyout domain.key -out domain.csr
== pass in you info for -subj "/C=US/ST=New York/L=Brooklyn/O=Example Brooklyn Company/CN=examplebrooklyn.com"

# There is also the capture server program which uses libcamera-vid and libcamera-still
- this has dependencies on ffmpeg and gstreamer plugins 
- on raspian you need to sudo apt-get install gstreamer1.0-plugins-base-apps ffmpeg