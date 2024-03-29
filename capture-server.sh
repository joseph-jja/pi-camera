#! /bin/sh
### BEGIN INIT INFO
# Provides:          capture-server.sh
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
NODE_DIR=`find /home/pi/.nvm/versions/node -maxdepth 1 -type d |tail -1`
FOREVER_BIN=/home/pi/.nvm/versions/node/v16.14.0/bin/forever
NODE_BIN=/home/pi/.nvm/versions/node/v16.14.0/bin
export PATH=$NODE_BIN:$PATH

# forever setup
FOREVER_LOG=/tmp/forever.log
APP_LOG=/tmp/pi-capture-server.log
APP_ERR_LOG=/tmp/pi-capture-server.error.log
LOG_FILES="-a -l $FOREVER_LOG -o $APP_LOG -e $APP_ERR_LOG "
PID_FILE=/tmp/forever.pid
FOREVER_OPTS="$LOG_FILES --pidFile $PID_FILE --spinSleepTime 1000 --minUptime 500"

# pi camera code setup
CODE_HOME=/home/pi/pi-camera
PI_CAMERA_JS=capture-server.mjs

start_program () {
    cd $CODE_HOME && $FOREVER_BIN start $FOREVER_OPTS $PI_CAMERA_JS $CONFIG
}

stop_program () {
    cd $CODE_HOME && $FOREVER_BIN stop $PI_CAMERA_JS
}

do_status () {
    cd $CODE_HOME && $FOREVER_BIN list
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
