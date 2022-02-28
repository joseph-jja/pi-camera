#! /bin/sh
### BEGIN INIT INFO
# Provides:          pi-capture.sh
# Required-Start:    $local_fs $network $syslog $time $remote_fs
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Runs the pi camera video capture software.
# Description:       Nodejs program to capture video and send email.
### END INIT INFO

#
# Nodejs program to capture video and send email.
#

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
. /lib/init/vars.sh

FOREVER_ROOT=/tmp
export FOREVER_ROOT

USR_BIN=/usr/bin/
export USR_BIN
export PATH=$USR_BIN:$PATH

# setup full path to binary files
FOREVER_BIN=/home/pi/.nvm/versions/node/v16.14.0/bin/forever

# forever setup
FOREVER_LOG=/tmp/forever.log
APP_LOG=/tmp/pi-camera.log
APP_ERR_LOG=/tmp/pi-camera.error.log
LOG_FILES="-a -l $FOREVER_LOG -o $APP_LOG -e $APP_ERR_LOG "
PID_FILE=/var/run/forever.pid
FOREVER_OPTS="$LOG_FILES --pidFile $PID_FILE --spinSleepTime 1000 --minUptime 500"

# pi camera code setup
BASE_CODE=/home/pi/pi-camera
PI_CAMERA_JS=capture.js

# client condig
WEB_PID_FILE=/var/run/forever.pid
WEB_APP_LOG=/var/log/pi-capture.log
WEB_APP_ERR_LOG=/var/log/pi-capture.error.log
WEB_LOG_FILES="-a -l $FOREVER_LOG -o $WEB_APP_LOG -e $WEB_APP_ERR_LOG "
FOREVER_WEB_OPTS="$WEB_LOG_FILES --pidFile $WEB_PID_FILE --spinSleepTime 1000 --minUptime 500"

start_program () {
    cd $BASE_CODE && $FOREVER_BIN start $FOREVER_OPTS $PI_CAMERA_JS $CONFIG
}

stop_program () {
    cd $BASE_CODE && $FOREVER_BIN stop $PI_CAMERA_JS
}

do_status () {
    cd $BASE_CODE && $FOREVER_BIN list
}

case "$1" in
  start)
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

