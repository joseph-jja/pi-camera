#! /bin/sh
### BEGIN INIT INFO
# Provides:          pi-camera
# Required-Start:    forever
# Required-Stop:
# Default-Start:     S
# Default-Stop:
# Short-Description: Runs the pi camera video capture software.
# Description:       Nodejs program to capture video and send email.
### END INIT INFO

#
# Nodejs program to capture video and send email.
#

PATH=/sbin:/bin
. /lib/init/vars.sh
. /lib/init/tmpfs.sh

TTYGRP=5
TTYMODE=620
[ -f /etc/default/devpts ] && . /etc/default/devpts

KERNEL="$(uname -s)"

. /lib/lsb/init-functions
. /lib/init/mount-functions.sh

# should setup full path to forever binary
FOREVER_BIN=forever

# code home
BASE_CODE=/home/pi/pi-camera

# startup file
PI_CAMERA_JS=$BASE_CODE/index.js

start_program () {
    $FOREVER_BIN start $PI_CAMERA_JS
}

stop_program () {
    $FOREVER_BIN stop $PI_CAMERA_JS
}

case "$1" in
  start|"")
	start_program
	;;
  restart|reload|force-reload)
	echo "Error: argument '$1' not supported" >&2
	exit 3
	;;
  stop)
	stop_program
	;;
  *)
	echo "Usage: pi-camera.sh [start|stop]" >&2
	exit 3
	;;
esac

:
