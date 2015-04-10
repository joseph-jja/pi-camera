# pi-camera
This is a simple code couple of scripts for making a motion detection camera capture system using the raspberry pi, a pir sensor and a camera.

# to install
## install nodejs and forever
## clone this repo 
## create a config.json for the mail 
## if you are like me, you'll want a read only filesystem to save your sd card in case of power outage or just to reduce wear, so execute the following commands
### cd /home/pi/pi-camera
 cp ro_mount/cmdline.txt /boot
### mkdir /orig
### cp ro_mount/fstab /etc
### cp ro_mount/rc.local /etc
### cp -r /etc /orig/
### cp -r /var /orig/
### cp ro_mount/mount_unionfs /usr/local/bin
## rc.local has use this command to flush buffers - I put this in rc.local
### echo 3 > /proc/sys/vm/drop_caches

# disable the swap partitiion because you don't want all those writes to disk
sudo swapoff -a
sudo update-rc.d -f dphys-swapfile remove
sudo rm /var/swap

# NOTE: code taken from pi_videoEMailIntruder
