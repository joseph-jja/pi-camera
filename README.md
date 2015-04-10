# pi-camera
This is a simple code couple of scripts for making a motion detection camera capture system using the raspberry pi, a pir sensor and a camera.

# to install
- install nodejs and forever
- clone this repo 
- create a config.json for the mail 

# use this command to flush buffers - I put this in rc.local
echo 3 > /proc/sys/vm/drop_caches

# disable the swap partitiion because you don't want all those writes to disk
sudo swapoff -a
sudo update-rc.d -f dphys-swapfile remove
sudo rm /var/swap

# NOTE: code taken from pi_videoEMailIntruder
