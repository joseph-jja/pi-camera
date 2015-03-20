#!/usr/bin/python
import RPi.GPIO as GPIO
import time
import picamera
import smtplib
import mimetypes
from os import rename

# Here are the email package modules we'll need
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from email.mime.multipart import MIMEMultipart

smpt_host = your host
smpt_port = your host port
user = user
your_pass = your pass

sensorPin = 16
baseDir = '/tmp/'

GPIO.setmode(GPIO.BOARD)
GPIO.setup(sensorPin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

GPIO.add_event_detect(sensorPin, GPIO.RISING)

COMMASPACE = ', '

def sendMail(login, password, send_file):

	print("Sending Mail Start ...")
	msg = MIMEMultipart()
	msg['To'] = login
        msg['From'] = login
        #msg['Date'] = formatdate(localtime=True)
        msg.preamble = 'You will not see this in a MIME-aware mail reader.\n'

	msg.attach( MIMEText('motion detected') )

	part = MIMEBase('application', mimetypes.guess_type(send_file))
        vfile = open(send_file,"rb")
	part.set_payload( vfile.read() )
        vfile.close()
	encoders.encode_base64(part)
	part.add_header('Content-Disposition', 'attachment', filename=send_file)
	msg.attach(part)

	smtp = smtplib.SMTP(smtp_host, smtp_port)
	#smtp.set_debuglevel(1) 
	smtp.ehlo() 
	smtp.starttls() 
	smtp.login(login, password) 
	smtp.sendmail(login, login, msg.as_string() )
	smtp.quit()
	print("Sending Mail End ...")

def recordVideo():
	with picamera.PiCamera() as camera:
		camera.start_preview()
		print("Recording Start ...")
		timeInfo = time.strftime("%H_%M_%S", time.gmtime(time.clock()))
		videoFile = baseDir + 'video' +  timeInfo + '.h264'
		camera.resolution = (800, 600)
		camera.start_recording(videoFile)
		#time.sleep(15)
		camera.wait_recording(5)
		print("Recording End ...")
		mpegVideo = baseDir + 'video' +  timeInfo + '.mpeg'
		rename(videoFile, mpegVideo)
		camera.stop_recording()
		camera.stop_preview()
		sendMail(user, your_pass, mpegVideo)

while True:
	time.sleep(.1)
	#GPIO.wait_for_edge(sensorPin, GPIO.RISING)
	print GPIO.input(sensorPin)
	if GPIO.event_detected(sensorPin) and GPIO.input(sensorPin) == 1:
		recordVideo() 

			

# GPIO.remove_event_detect(sensorPin)
