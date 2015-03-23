#! /bin/sh
### BEGIN INIT INFO
# Provides:          pi-camera.sh
# Required-Start:    $syslog
# Required-Stop:     $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Runs the pi camera video capture software.
# Description:       Nodejs program to capture video and send email.
### END INIT INFO

#
# Nodejs program to capture video and send email.
#

PATH=/sbin:/bin:/usr/local/bin
. /lib/init/vars.sh

# should setup full path to forever binary
FOREVER_BIN=/usr/local/bin/forever
FOREVER_LOG=/var/log/forever.log
APP_LOG=/var/log/pi-camera.log
APP_ERR_LOG=/var/log/pi-camera.error.log
PID_FILE=/var/run/forever.pid

# sudo
SUDO=/usr/bin/sudo 

# code home
BASE_CODE=/home/pi/pi-camera

# startup file
#PI_CAMERA_JS=$BASE_CODE/index.js
PI_CAMERA_JS=index.js
CONFIG=/home/pi/config.json

# log files 
LOG_FILES="-a -l $FOREVER_LOG -o $APP_LOG -e $APP_ERR_LOG "

# forever options
FOREVER_OPTS="$LOG_FILES --sourceDir $BASE_CODE --workingDir $BASE_CODE --pidFile $PID_FILE --spinSleepTime 1000 --minUptime 500"

start_program () {
    $SUDO $FOREVER_BIN start $FOREVER_OPTS $PI_CAMERA_JS $CONFIG
}

stop_program () {
    $SUDO $FOREVER_BIN stop $PI_CAMERA_JS
}

do_status () {
    /usr/bin/sudo $FOREVER_BIN list
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
  status)
  	do_status
  	;;
  *)
	echo "Usage: pi-camera.sh [start|stop|status]" >&2
	exit 3
	;;
esac

:
