#! /bin/sh

kill -9 `ps -ef |grep ffmpeg |grep -v capture |grep -v grep| awk '{print $2}'`
