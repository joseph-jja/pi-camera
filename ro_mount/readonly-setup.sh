#! /bin/sh

# taken from http://k3a.me/how-to-make-raspberrypi-truly-read-only-reliable-and-trouble-free/

sudo  apt-get remove --purge wolfram-engine triggerhappy cron anacron logrotate dbus dphys-swapfile xserver-common lightdm fake-hwclock

sudo insserv -r x11-common
sudo apt-get autoremove --purge

sudo apt-get install busybox-syslogd
sudo dpkg --purge rsyslog

sudo insserv -r alsa-utils # if you don't need alsa stuff (sound output)
sudo insserv -r fake-hwclock # probably already removed at this point..
