#! /bin/sh

# taken from http://k3a.me/how-to-make-raspberrypi-truly-read-only-reliable-and-trouble-free/

sumo dphys-swapfile swapoff
sumo dphys-swapfile uninstall
sumo update-rc.d dphys-swapfile disable

#sudo  apt-get remove --purge wolfram-engine triggerhappy cron anacron logrotate dbus dphys-swapfile xserver-common lightdm fake-hwclock
sudo  apt-get remove --purge wolfram-engine triggerhappy dphys-swapfile xserver-common lightdm fake-hwclock

sudo insserv -r x11-common
sudo apt-get autoremove --purge

sudo apt-get install busybox-syslogd
sudo dpkg --purge rsyslog

sudo insserv -r alsa-utils # if you don't need alsa stuff (sound output)
sudo insserv -r fake-hwclock # probably already removed at this point..

# make these tmpfs?
#rm -rf /var/lib/dhcp/
#ln -s /tmp /var/lib/dhcp

#You can consider adding more symlinks from some /var subdirectories, especially run,spool and lock
#rm -rf /var/run /var/spool /var/lock
#ln -s /tmp /var/run 
#ln -s /tmp /var/spool
#ln -s /tmp /var/lock
